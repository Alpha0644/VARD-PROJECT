# COMPLIANCE & LEGAL v2.0

## 🌍 JURISDICTION
This document covers compliance for:
- 🇪🇺 **European Union** (RGPD/GDPR)
- 🇫🇷 **France** (CNIL, Accessibility mandate)
- 🌐 **International** (PCI-DSS for payments)

---

## 1. RGPD/GDPR COMPLIANCE

### Data Protection Principles
```
1. Lawfulness: Only collect data with valid legal basis (consent, contract, legitimate interest)
2. Purpose Limitation: Use data only for stated purposes
3. Data Minimization: Collect only what's necessary
4. Accuracy: Keep data up-to-date
5. Storage Limitation: Delete data when no longer needed
6. Integrity: Protect data with appropriate security
7. Accountability: Document compliance measures
```

### Required Legal Pages

#### Privacy Policy (`/privacy`)
Must include:
- ✅ Identity of data controller (your company)
- ✅ Types of data collected
- ✅ Purpose of collection
- ✅ Legal basis for processing
- ✅ Data retention periods
- ✅ User rights (access, rectification, deletion, portability)
- ✅ How to exercise rights (email/form)
- ✅ Data transfers outside EU (if applicable)
- ✅ Contact info for DPO (if applicable) or CNIL

#### Terms of Service (`/terms`)
Must include:
- ✅ Service description
- ✅ User obligations
- ✅ Intellectual property
- ✅ Liability limitations
- ✅ Governing law & jurisdiction

#### Cookie Policy (`/cookies`)
Must include:
- ✅ Types of cookies used
- ✅ Purpose of each cookie
- ✅ How to refuse cookies

### Cookie Consent Banner

**Requirement:** Users must consent BEFORE any tracking cookies are set.

**Implementation:**
```typescript
// Use a library like @cookie3/banner or build with:
// 1. Show banner on first visit
// 2. Block analytics scripts until "Accept" is clicked
// 3. Store consent in localStorage
// 4. Provide "Manage preferences" link in footer

// Example with Next.js
export function CookieBanner() {
  const [consent, setConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    setConsent(stored === 'true')
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setConsent(true)
    
    // Now load analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  if (consent !== null) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <p>We use cookies to improve your experience. 
        <Link href="/cookies">Learn more</Link>
      </p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={() => setConsent(false)}>Reject</button>
    </div>
  )
}
```

### User Rights Implementation

#### 1. Right to Access (Data Export)
```typescript
// /app/api/user/export/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  // Collect ALL user data
  const userData = {
    profile: await db.user.findUnique({ where: { id: session.user.id }}),
    orders: await db.order.findMany({ where: { userId: session.user.id }}),
    payments: await db.payment.findMany({ where: { userId: session.user.id }}),
    // ... all related data
  }

  // Return as downloadable JSON
  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="my-data-${Date.now()}.json"`
    }
  })
}
```

#### 2. Right to Erasure (Account Deletion)
```typescript
// /app/api/user/delete/route.ts
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // Delete in correct order (respect foreign keys)
  await db.$transaction([
    db.payment.deleteMany({ where: { userId }}),
    db.order.deleteMany({ where: { userId }}),
    db.session.deleteMany({ where: { userId }}),
    db.user.delete({ where: { id: userId }}),
  ])

  // Also delete files from storage
  await storage.deleteFolder(`users/${userId}`)

  return new Response('Account deleted', { status: 200 })
}
```

#### 3. Right to Rectification (Update Profile)
```typescript
// Already implemented in standard update endpoint
// Just ensure users can edit ALL their data
```

#### 4. Right to Portability
Same as "Right to Access" (export JSON)

### Data Retention Policy
```typescript
// Document in /legal/data-retention.md
/**
 * - User accounts: Until user deletes account
 * - Inactive accounts: Delete after 3 years of inactivity
 * - Order history: 10 years (legal requirement for accounting)
 * - Logs: 30 days (unless security incident)
 * - Backups: 30 days rolling
 */

// Implement automated cleanup
// /scripts/cleanup-inactive-users.ts
import { db } from '@/lib/db'

async function cleanupInactiveUsers() {
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  const inactiveUsers = await db.user.findMany({
    where: {
      lastLoginAt: { lt: threeYearsAgo },
      createdAt: { lt: threeYearsAgo },
    }
  })

  console.log(`Found ${inactiveUsers.length} inactive users`)

  // Send warning email 30 days before deletion
  // Then delete if no response
}
```

---

## 2. ACCESSIBILITY (a11y) - WCAG 2.1 AA

### Legal Requirement
- 🇫🇷 France: **Mandatory** for public services and companies > €250M revenue
- 🇪🇺 EU: European Accessibility Act (2025)

### Checklist

#### Perceivable
```
✅ All images have alt text
✅ Color contrast ratio ≥ 4.5:1 for normal text
✅ Color contrast ratio ≥ 3:1 for large text (18pt+)
✅ Don't rely solely on color to convey information
✅ Videos have captions
```

#### Operable
```
✅ All functionality available via keyboard
✅ No keyboard traps
✅ Skip to main content link
✅ Focus indicators visible
✅ No content flashes more than 3 times/second (seizure risk)
```

#### Understandable
```
✅ Page language declared (<html lang="fr">)
✅ Labels on all form inputs
✅ Error messages are clear and helpful
✅ Navigation is consistent across pages
```

#### Robust
```
✅ Valid HTML (no unclosed tags)
✅ ARIA attributes used correctly
✅ Compatible with assistive technologies (screen readers)
```

### Implementation Examples

```tsx
// ✅ GOOD: Accessible button
<button
  aria-label="Close dialog"
  onClick={handleClose}
>
  <X className="w-4 h-4" />
  <span className="sr-only">Close</span> {/* Screen reader only */}
</button>

// ✅ GOOD: Accessible form
<form>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    name="email"
    aria-required="true"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby="email-error"
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-red-600">
      {errors.email}
    </p>
  )}
</form>

// ✅ GOOD: Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* Page content */}
</main>
```

### Testing Accessibility
```bash
# Automated tests with Playwright + Axe
npm run test:a11y

# Manual testing with screen reader
# - macOS: VoiceOver (Cmd+F5)
# - Windows: NVDA (free)
# - Chrome extension: axe DevTools
```

---

## 3. PCI-DSS (Payment Card Industry)

**If you handle payments, you MUST comply.**

### Golden Rule: **NEVER STORE CARD DATA**

```typescript
// ❌ FORBIDDEN:
await db.payment.create({
  data: {
    cardNumber: '4242424242424242', // NEVER
    cvv: '123', // NEVER
    expiry: '12/25', // NEVER
  }
})

// ✅ REQUIRED: Use Stripe tokenization
// Card data goes directly to Stripe via Stripe.js
// You only receive a token
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'eur',
  payment_method: token, // Token from Stripe.js
})
```

### PCI Compliance Checklist (Stripe handles most)
```
✅ Use Stripe Elements for card input (client-side)
✅ Never log card numbers
✅ Use HTTPS everywhere
✅ Implement strong access controls
✅ Regularly update dependencies
✅ Monitor for breaches (use Sentry, Logtail)
```

### Webhook Security
```typescript
// ALWAYS verify Stripe signatures
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  // Now safe to process
  if (event.type === 'payment_intent.succeeded') {
    // Update order
  }

  return new Response('OK')
}
```

---

## 4. EMAIL COMPLIANCE (CAN-SPAM, RGPD)

### Transactional Emails (Order confirmations, password resets)
✅ No consent required
✅ Must include your company address
✅ Must have unsubscribe link (even for transactional)

### Marketing Emails
❌ Consent required (opt-in checkbox)
✅ Clear unsubscribe link
✅ Honor unsubscribe within 10 days
✅ Include physical address

### Implementation
```typescript
// /lib/email/send.ts
export async function sendMarketingEmail(to: string, content: string) {
  // Check if user is subscribed
  const user = await db.user.findUnique({ where: { email: to }})
  
  if (!user?.marketingConsent) {
    throw new Error('User has not consented to marketing emails')
  }

  await resend.emails.send({
    from: 'hello@example.com',
    to,
    subject: 'Our latest offers',
    html: `
      ${content}
      <hr>
      <p style="font-size: 12px; color: #666;">
        You are receiving this because you subscribed.<br>
        Company Name, 123 Main St, Paris 75001, France<br>
        <a href="${process.env.NEXT_PUBLIC_URL}/unsubscribe?token=${user.unsubscribeToken}">
          Unsubscribe
        </a>
      </p>
    `
  })
}
```

---

## 5. AGE VERIFICATION (COPPA, RGPD)

If your service is NOT suitable for children < 13 (US) or < 16 (EU):

```typescript
// Add to registration form
export const registerSchema = z.object({
  // ...
  birthdate: z.string().datetime().refine(
    (date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear()
      return age >= 16
    },
    { message: "You must be at least 16 years old" }
  )
})
```

---

## 6. CONTENT MODERATION (DSA - Digital Services Act)

If you allow user-generated content (comments, posts):

```
✅ Implement reporting mechanism
✅ Review and remove illegal content within 24h
✅ Keep records of moderation actions (7 months)
✅ Inform users of removals
```

---

## 7. TAX COMPLIANCE (VAT for EU SaaS)

```typescript
// You must charge VAT based on customer location
// Use a service like Stripe Tax or TaxJar

// Example with Stripe
await stripe.checkout.sessions.create({
  line_items: [{
    price: 'price_xxx',
    quantity: 1,
  }],
  automatic_tax: { enabled: true }, // Stripe calculates VAT
  customer: customerId,
})
```

---

## 8. VULNERABILITY DISCLOSURE POLICY

Create `/security.txt` (RFC 9116):
```
# /public/.well-known/security.txt
Contact: security@example.com
Expires: 2026-12-31T23:59:59Z
Preferred-Languages: en, fr
Policy: https://example.com/security-policy
```

---

## 9. DOCUMENTATION REQUIRED

Create these files in `/legal` or `/about`:
```
✅ /privacy - Privacy Policy
✅ /terms - Terms of Service
✅ /cookies - Cookie Policy
✅ /security - Vulnerability Disclosure
✅ /accessibility - Accessibility Statement
✅ /legal - Legal Notices (mention légales)
```

---

## 10. ANNUAL COMPLIANCE CHECKLIST

```
🔄 Every 12 months:
- [ ] Review and update Privacy Policy
- [ ] Review data retention (delete old data)
- [ ] Security audit (penetration test)
- [ ] Accessibility audit (WCAG compliance)
- [ ] Update dependencies (npm audit)
- [ ] Review user permissions (remove ex-employees)
- [ ] Test backup restoration
```

---

**Last Updated:** 2025-12-29  
**Do not launch without legal review by a qualified attorney.**
