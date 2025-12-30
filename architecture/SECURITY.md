# SECURITY PROTOCOLS v2.0

## 🔴 THREAT MODEL

This application handles:
- ✅ User authentication (email/password, OAuth)
- ✅ Personal data (RGPD-protected)
- ✅ Financial transactions (PCI-DSS scope)
- ✅ File uploads (malware risk)

**Assumption:** Attackers have:
- Automated scanners (OWASP ZAP, SQLMap)
- Knowledge of common vulnerabilities (OWASP Top 10)
- Time to manually analyze the app

**Goal:** Make the cost of attack > value of data

---

## 1. AUTHENTICATION & SESSION MANAGEMENT

### Password Requirements (Enforced with Zod)
```typescript
// /lib/validation/auth.ts
export const passwordSchema = z.string()
  .min(12, "Minimum 12 characters")
  .regex(/[A-Z]/, "At least 1 uppercase")
  .regex(/[a-z]/, "At least 1 lowercase")
  .regex(/[0-9]/, "At least 1 number")
  .regex(/[^A-Za-z0-9]/, "At least 1 special character")

// Hash with bcrypt (cost factor 12)
const hashedPassword = await bcrypt.hash(password, 12)
```

### Session Security
```typescript
// JWT Configuration (next-auth)
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET, // 32+ random chars
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only
      },
    },
  },
}
```

### Multi-Factor Authentication (Optional but Recommended)
```typescript
// Use @simplewebauthn/server for WebAuthn (passkeys)
// Or use TOTP (RFC 6238) via 'otpauth'
```

---

## 2. AUTHORIZATION (ACCESS CONTROL)

### Role-Based Access Control (RBAC)
```typescript
// /lib/auth/roles.ts
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export const permissions = {
  [Role.USER]: ["read:own", "write:own"],
  [Role.MODERATOR]: ["read:own", "write:own", "read:all"],
  [Role.ADMIN]: ["*"], // All permissions
}

// Middleware to protect routes
export async function requireRole(role: Role) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== role) {
    throw new UnauthorizedError("Insufficient permissions")
  }
}
```

### Row Level Security (RLS) in Database
```sql
-- Supabase/PostgreSQL policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### Prevent IDOR (Insecure Direct Object Reference)
```typescript
// ❌ BAD: User can change ID in URL to see other orders
app.get("/api/orders/:id", async (req, res) => {
  const order = await db.order.findUnique({ where: { id: req.params.id }})
  res.json(order) // No ownership check!
})

// ✅ GOOD: Check ownership
app.get("/api/orders/:id", async (req, res) => {
  const userId = req.session.userId
  const order = await db.order.findFirst({
    where: {
      id: req.params.id,
      userId: userId, // Must belong to logged-in user
    }
  })
  
  if (!order) return res.status(404).json({ error: "Not found" })
  res.json(order)
})
```

---

## 3. INPUT VALIDATION (DEFENSE IN DEPTH)

### ALWAYS USE ZOD FOR EXTERNAL INPUTS
```typescript
// /lib/validation/user.ts
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
})

// API Route
export async function POST(req: Request) {
  const body = await req.json()
  
  // Validate FIRST
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.format() },
      { status: 400 }
    )
  }
  
  // Use parsed.data (sanitized and typed)
  const { name, email } = parsed.data
  // ...
}
```

### SQL Injection Prevention
```typescript
// ❌ FORBIDDEN: String concatenation
const users = await db.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ REQUIRED: Parameterized queries
const users = await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`
// Or use Prisma ORM (automatically safe)
const user = await db.user.findUnique({ where: { email }})
```

### XSS (Cross-Site Scripting) Prevention
```tsx
// React automatically escapes content, BUT:

// ❌ DANGEROUS: 
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE: Use a sanitizer
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ BEST: Avoid HTML input altogether
<div>{userInput}</div> // React auto-escapes
```

### File Upload Validation
```typescript
// /app/api/upload/route.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  
  // 1. Check file exists
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  
  // 2. Check size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 413 })
  }
  
  // 3. Check MIME type (not just extension!)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 415 })
  }
  
  // 4. Rename file (never trust user filename)
  const ext = file.name.split('.').pop()
  const newFilename = `${crypto.randomUUID()}.${ext}`
  
  // 5. (Optional) Virus scan with ClamAV or VirusTotal API
  
  // 6. Upload to secure storage
  const uploaded = await storage.upload(newFilename, file)
  
  return NextResponse.json({ url: uploaded.url })
}
```

---

## 4. SECRETS MANAGEMENT

### Environment Variables
```bash
# .env.local (NEVER commit this file)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

```bash
# .env.example (commit this as template)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-here-min-32-chars"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
```

### Secret Rotation
```
🔄 Rotate secrets every 90 days:
- NEXTAUTH_SECRET
- API keys
- Database passwords (coordinate with team)
```

### Detection of Hardcoded Secrets
```bash
# Pre-commit hook (/.husky/pre-commit)
#!/bin/sh
grep -rE "(sk_live|pk_live|password\s*=\s*[\"'])" src/ && {
  echo "❌ ERROR: Hardcoded secret detected!"
  exit 1
}
```

---

## 5. RATE LIMITING & DOS PROTECTION

### API Rate Limiting
```typescript
// /lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export const rateLimiters = {
  // Strict limits for auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 min
    analytics: true,
  }),
  
  // Standard limits for API
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 req per minute
  }),
}

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const { success } = await rateLimiters.auth.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    )
  }
  
  // Continue with logic
}
```

---

## 6. SECURITY HEADERS (next.config.js)

```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN", // Prevent clickjacking
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 7. DEPENDENCY SECURITY

### Regular Audits
```bash
# Run weekly (automate with GitHub Actions)
npm audit

# Fix automatically if possible
npm audit fix

# If HIGH/CRITICAL issues remain:
# - Update manually or find alternative package
# - NEVER deploy with known vulnerabilities
```

### Automated Scanning (GitHub Actions)
```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm audit --audit-level=high
```

---

## 8. ERROR HANDLING & LOGGING

### Never Expose Stack Traces
```typescript
// ❌ BAD:
app.get("/api/users", async (req, res) => {
  const users = await db.user.findMany()
  res.json(users) // If error, full stack trace sent to client
})

// ✅ GOOD:
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.user.findMany()
    res.json(users)
  } catch (error) {
    // Log to monitoring service (Sentry, Logtail)
    logger.error("Failed to fetch users", { error, userId: req.session.userId })
    
    // Return generic message to client
    res.status(500).json({ error: "Internal server error" })
  }
})
```

### Structured Logging
```typescript
// /lib/logger.ts
import { createLogger } from "axiom-node"

export const logger = createLogger({
  dataset: process.env.AXIOM_DATASET,
  token: process.env.AXIOM_TOKEN,
})

// Usage
logger.info("User logged in", {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
})

logger.error("Payment failed", {
  userId: user.id,
  amount: order.total,
  error: error.message,
  orderId: order.id,
})
```

---

## 9. PAYMENT SECURITY (Stripe Best Practices)

### Never Store Card Details
```typescript
// ✅ Use Stripe Elements (client-side tokenization)
// Card details go directly to Stripe, never touch your server
```

### Verify Webhook Signatures
```typescript
// /app/api/webhooks/stripe/route.ts
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  
  let event: Stripe.Event
  
  try {
    // Verify signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    logger.error("Webhook signature verification failed", { error: err })
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }
  
  // Process verified event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    // Update order status in database
  }
  
  return NextResponse.json({ received: true })
}
```

### Idempotency for Payment Retries
```typescript
// Prevent double-charging on retry
await stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
}, {
  idempotencyKey: `order_${orderId}`, // Same key = same result
})
```

---

## 10. SECURITY CHECKLIST (Pre-Deployment)

```
Before deploying to production:

🔒 Authentication
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] JWT secret is 32+ random characters
- [ ] Refresh tokens implemented
- [ ] Rate limiting on /login (5 attempts per 15 min)

🔑 Authorization
- [ ] Row Level Security enabled on database
- [ ] IDOR protection (ownership checks)
- [ ] Admin routes protected by middleware

🛡️ Input Validation
- [ ] Zod schemas on ALL API inputs
- [ ] File uploads validated (type + size + virus scan)
- [ ] SQL injection impossible (using ORM)
- [ ] XSS protection (no dangerouslySetInnerHTML without sanitizer)

🔐 Secrets
- [ ] No hardcoded secrets (grep check)
- [ ] .env files in .gitignore
- [ ] .env.example provided

⚡ Rate Limiting
- [ ] Auth endpoints limited (5/15min)
- [ ] API endpoints limited (100/min)
- [ ] File uploads limited (10MB max)

🔧 Headers
- [ ] CSP configured
- [ ] HSTS enabled
- [ ] X-Frame-Options set

📦 Dependencies
- [ ] npm audit shows 0 HIGH/CRITICAL
- [ ] All packages < 6 months old

🔍 Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Logging configured (Axiom/Logtail)
- [ ] Uptime monitoring (BetterUptime)

💳 Payments (if applicable)
- [ ] Using Stripe Elements (never raw card inputs)
- [ ] Webhook signatures verified
- [ ] Idempotency keys on payment creation
```

---

**Last Updated:** 2025-12-29  
**Review:** After each security incident or quarterly
