# DEPLOYMENT & DevOps v2.0

## 🎯 DEPLOYMENT PHILOSOPHY

```
"If it hurts, do it more often."
"Automate everything that can be automated."
"Rollback must be faster than rollout."
```

---

## 1. ENVIRONMENTS

### Local Development
```bash
# .env.local
DATABASE_URL="postgresql://localhost:5432/myapp_dev"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Staging (Pre-Production)
```bash
# .env.staging
DATABASE_URL="postgresql://staging.supabase.co/..."
NEXTAUTH_URL="https://staging.example.com"
NODE_ENV="production"
```

### Production
```bash
# .env.production (managed via Vercel/Railway dashboard)
DATABASE_URL="postgresql://prod.supabase.co/..."
NEXTAUTH_URL="https://example.com"
NODE_ENV="production"
```

**Rule:** NEVER deploy directly to production. Always test on staging first.

---

## 2. PRE-DEPLOYMENT CHECKLIST

### Automated Checks (CI/CD runs these)
```bash
✅ npm run lint          # ESLint passes
✅ npm run type-check    # TypeScript compiles
✅ npm run test          # All tests pass
✅ npm run build         # Production build succeeds
✅ npm audit --production # No HIGH/CRITICAL vulnerabilities
```

### Manual Checks
```
✅ Environment variables set in deployment platform
✅ Database migrations tested on staging
✅ Backup created before deployment
✅ Rollback plan documented
✅ Monitoring/alerting configured
✅ Changelog updated
```

---

## 3. CI/CD PIPELINE (GitHub Actions)

### Basic Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. CODE QUALITY
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  # 2. TYPE SAFETY
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check

  # 3. SECURITY AUDIT
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=high

  # 4. UNIT TESTS
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # 5. E2E TESTS
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  # 6. BUILD
  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, security, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          SIZE=$(du -sb .next | cut -f1)
          if [ $SIZE -gt 5000000 ]; then
            echo "Bundle too large: ${SIZE} bytes"
            exit 1
          fi

  # 7. DEPLOY TO STAGING (on main branch)
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: staging

  # 8. DEPLOY TO PRODUCTION (manual approval)
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    environment: production # Requires manual approval in GitHub
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 4. DATABASE MIGRATIONS

### Strategy: Blue-Green Migrations
```
1. Make schema changes BACKWARD COMPATIBLE
   - Add new columns as NULLABLE first
   - Deprecate old columns (don't delete immediately)

2. Deploy new code (uses new schema)

3. Backfill data if needed

4. After 1 week, remove old columns (new schema)
```

### Prisma Migration Workflow
```bash
# 1. Create migration (local)
npx prisma migrate dev --name add_user_role

# 2. Test migration on staging database
DATABASE_URL="postgresql://staging..." npx prisma migrate deploy

# 3. Verify app works on staging

# 4. Deploy to production
DATABASE_URL="postgresql://prod..." npx prisma migrate deploy
```

### Rollback Strategy
```bash
# If migration fails in production:

# Option 1: Revert migration (if no data written yet)
npx prisma migrate resolve --rolled-back <migration-name>

# Option 2: Forward fix (if data already written)
# - Create new migration that undoes changes
# - Deploy emergency patch
```

---

## 5. ZERO-DOWNTIME DEPLOYMENT

### Vercel (Recommended for Next.js)
- ✅ Automatic zero-downtime (atomic deployments)
- ✅ Instant rollback (previous deployment stays live)
- ✅ Preview deployments for every PR

### Manual Setup (Railway, Fly.io)
```yaml
# Use health checks + rolling updates
healthcheck:
  path: /api/health
  interval: 10s
  timeout: 5s
  retries: 3

deploy:
  strategy: rolling
  max_surge: 1
  max_unavailable: 0
```

---

## 6. MONITORING & OBSERVABILITY

### Health Check Endpoint
```typescript
// /app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`

    // Check Redis (if used)
    await redis.ping()

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION,
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

### Error Tracking (Sentry)
```typescript
// /lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }
    return event
  },
})
```

### Uptime Monitoring
```
Use services like:
- BetterUptime (https://betteruptime.com)
- UptimeRobot (https://uptimerobot.com)
- Pingdom

Configure:
- Check /api/health every 1 minute
- Alert via email/SMS/Slack if down
- Check from multiple locations
```

### Logging (Structured)
```typescript
// /lib/logger.ts
import { createLogger } from 'axiom-node'

export const logger = createLogger({
  dataset: process.env.AXIOM_DATASET!,
  token: process.env.AXIOM_TOKEN!,
})

// Usage
logger.info('User signed up', {
  userId: user.id,
  email: user.email,
  plan: 'free',
  referrer: req.headers.get('referer'),
})

logger.error('Payment failed', {
  userId: user.id,
  orderId: order.id,
  amount: order.total,
  error: error.message,
  stripeError: error.code,
})
```

---

## 7. BACKUP STRATEGY

### Database Backups
```
🎯 Frequency:
- Automated daily backups (retain 30 days)
- Automated hourly backups (retain 7 days)
- Manual backup before each deployment

🎯 Storage:
- Store in different region than primary DB
- Encrypt backups at rest

🎯 Testing:
- Test restoration monthly
- Document restoration time (RTO: Recovery Time Objective)
```

### Supabase Backups (Automatic)
```
✅ Pro plan: Daily backups (7 days retention)
✅ Can download backups manually
```

### File Storage Backups
```bash
# If using Cloudflare R2 or similar
# Enable versioning to prevent accidental deletion
```

---

## 8. ROLLBACK PROCEDURE

### Vercel (1-Click Rollback)
```
1. Go to Vercel dashboard
2. Find previous deployment
3. Click "Promote to Production"
4. Done (< 1 minute)
```

### Manual Rollback
```bash
# 1. Revert to previous commit
git revert <commit-hash>
git push origin main

# 2. Re-deploy
npm run deploy

# 3. If database migration was involved:
# - Run backward migration (if prepared)
# - Or restore from backup (if breaking change)
```

---

## 9. INCIDENT RESPONSE

### Severity Levels
```
🔴 P0 (Critical): Site down, data loss, security breach
   → Response time: Immediate
   → Availability: 24/7

🟠 P1 (High): Major feature broken, affects many users
   → Response time: < 1 hour
   → Availability: Business hours

🟡 P2 (Medium): Minor feature broken, workaround exists
   → Response time: < 24 hours

🟢 P3 (Low): Cosmetic issues, enhancement requests
   → Response time: Best effort
```

### Incident Checklist
```
1. ASSESS
   - What is broken?
   - How many users affected?
   - Data at risk?

2. MITIGATE
   - Can we rollback?
   - Can we disable the feature?
   - Can we route traffic elsewhere?

3. COMMUNICATE
   - Update status page
   - Notify affected users
   - Internal team alert

4. FIX
   - Root cause analysis
   - Deploy fix
   - Verify resolution

5. POST-MORTEM
   - Document what happened
   - How to prevent in future
   - Update runbooks
```

---

## 10. SECRETS ROTATION

### Schedule
```
🔄 NEXTAUTH_SECRET: Every 90 days
🔄 Database passwords: Every 90 days
🔄 API keys (Stripe, etc.): Yearly or on breach
🔄 SSL certificates: Auto-renew (Let's Encrypt)
```

### Rotation Without Downtime
```
1. Create new secret
2. Add to environment (keep old one)
3. Deploy code that accepts both
4. Remove old secret after 24h grace period
```

---

## 11. PERFORMANCE BUDGETS

### Lighthouse Scores (Target)
```
🎯 Performance: > 90
🎯 Accessibility: > 95
🎯 Best Practices: > 95
🎯 SEO: > 95
```

### Bundle Size
```bash
# Analyze bundle
ANALYZE=true npm run build

# Set budgets in next.config.js
module.exports = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 512000, // 500 KB
        maxEntrypointSize: 512000,
        hints: 'error', // Fail build if exceeded
      }
    }
    return config
  },
}
```

---

## 12. DEPLOYMENT CHECKLIST (Summary)

```
Before Production Deploy:

🔒 SECURITY
- [ ] Secrets in environment variables (not code)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] npm audit shows 0 HIGH/CRITICAL

🧪 TESTING
- [ ] All tests pass (unit + E2E)
- [ ] Tested on staging
- [ ] Performance tested (Lighthouse > 90)

📊 MONITORING
- [ ] Error tracking active (Sentry)
- [ ] Uptime monitoring configured
- [ ] Logging configured

💾 BACKUP
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Tested database restoration (monthly)

📝 DOCUMENTATION
- [ ] CHANGELOG updated
- [ ] API docs updated (if applicable)
- [ ] Team notified of changes

🎯 COMPLIANCE
- [ ] Privacy policy updated (if data collection changed)
- [ ] Cookie banner functional
- [ ] Accessibility tested
```

---

**Last Updated:** 2025-12-29  
**Deploy with confidence, rollback without fear.**
