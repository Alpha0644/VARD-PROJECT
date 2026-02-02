# TECH STACK & CONSTRAINTS v2.0

## CORE FRAMEWORK
- **Framework:** Next.js 15+ (App Router with Server Actions)
- **Language:** TypeScript 5.0+ (Strict Mode)
- **Runtime:** Node.js 20+ LTS
- **Package Manager:** npm (lockfile must be committed)

## DATABASE & ORM
- **Database:** PostgreSQL 15+ via Supabase
- **ORM:** Prisma 5+ (with Prisma Accelerate for edge caching)
- **Migrations:** Prisma Migrate (never manual SQL in production)
- **Query Optimization:** 
  - Use `include` for relations (avoid N+1)
  - Use `select` to limit fields
  - Always paginate lists (default: 20 items)

## AUTHENTICATION & SECURITY
- **Auth:** NextAuth.js v5 (Auth.js) or Supabase Auth
- **Session:** JWT with refresh tokens (7 days access, 30 days refresh)
- **Security Headers:** next-safe (CSP, HSTS, X-Frame-Options)
- **Rate Limiting:** @upstash/ratelimit (Redis-based)
- **Validation:** Zod 3+ (ALL external inputs)

## FRONTEND & UI (STRICT - NO DEVIATIONS)
- **Styling:** Tailwind CSS 3.4+ (purge enabled)
- **Component Library:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React (tree-shakeable)
- **Forms:** React Hook Form + Zod resolver
- **State Management:**
  - Server state: TanStack Query (React Query)
  - Client state: Zustand (for complex global state)
  - URL state: nuqs (type-safe URL params)
- **Animation:** Framer Motion (code-split heavy animations)

### Design Tokens (Tailwind Config)
```javascript
// DO NOT create custom values outside these
colors: {
  primary: { 50-950 scale },
  secondary: { ... },
  accent: { ... },
  destructive: { ... }
}
spacing: { 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64 }
fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl }
```

## TESTING STACK
- **Unit/Integration:** Vitest (with @testing-library/react)
- **E2E:** Playwright
- **Visual Regression:** Playwright + Percy.io (optional)
- **API Testing:** MSW (Mock Service Worker)
- **Coverage:** NYC + Istanbul (min 85% for critical paths)

## PERFORMANCE MONITORING
- **Analytics:** Vercel Analytics (Web Vitals)
- **Error Tracking:** Sentry
- **Logging:** Axiom or Logtail (structured JSON logs)
- **Uptime:** BetterUptime or UptimeRobot

## PAYMENTS (If applicable)
- **Provider:** Stripe (never store card details)
- **Webhooks:** Secure with Stripe signature verification
- **PCI Compliance:** Use Stripe Elements (never raw input)

## EMAIL
- **Transactional:** Resend or SendGrid
- **Templates:** React Email (type-safe)
- **Deliverability:** SPF + DKIM + DMARC configured

## FILE STORAGE
- **Storage:** Supabase Storage or Cloudflare R2
- **CDN:** Cloudflare (auto-enabled with Vercel)
- **Images:** Next.js <Image> component (required)
- **Upload Validation:**
  - Max size: 10 MB
  - Allowed types: image/*, application/pdf
  - Virus scan: ClamAV or VirusTotal API

## ALLOWED DEPENDENCIES (PRE-APPROVED)
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "zod": "^3.22.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "next-auth": "^5.0.0-beta",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "latest",
    "zustand": "^4.4.0",
    "nuqs": "^1.0.0",
    "date-fns": "^3.0.0",
    "@upstash/ratelimit": "^1.0.0",
    "@sentry/nextjs": "^7.0.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

## FORBIDDEN DEPENDENCIES (DO NOT INSTALL)
```
❌ axios (use native fetch)
❌ moment.js (use date-fns or native Intl)
❌ lodash (use native methods or lodash-es for tree-shaking)
❌ jquery (seriously?)
❌ bootstrap (conflicts with Tailwind)
❌ any package with HIGH/CRITICAL npm audit issues
```

## BUNDLE SIZE BUDGET
```
🎯 First Load JS: < 200 KB
🎯 Route JS: < 50 KB per page
🎯 CSS: < 50 KB (Tailwind purged)
🎯 Images: WebP format, max 500 KB

Check with: npm run build
Analyze with: ANALYZE=true npm run build
```

## BROWSER SUPPORT
```
✅ Chrome/Edge (last 2 versions)
✅ Firefox (last 2 versions)
✅ Safari (last 2 versions)
✅ Mobile Safari iOS 14+
✅ Chrome Android (last version)
```

## RULES FOR INSTALLING NEW PACKAGES

### STEP 1: Check if it's NEEDED
```
1. Can native API do this? (e.g., Fetch, Intl, Array methods)
2. Is it in the approved list above?
3. Does an existing package cover this? (don't install 2 form libraries)
```

### STEP 2: Vet the package
```
✅ aktive maintenance (commit in last 6 months)
✅ > 100k weekly downloads (or solid niche package)
✅ TypeScript support
✅ Tree-shakeable (ESM exports)
✅ < 50 KB gzipped (check bundlephobia.com)
✅ No high/critical CVEs (npm audit)
```

### STEP 3: Ask permission
```
Prompt template:
"I need to install [PACKAGE_NAME] for [REASON].
Alternatives considered: [LIST]
Bundle impact: +[SIZE] KB
Is this approved?"
```

## VERSIONING STRATEGY
```
- Lock major versions (^15.0.0 not ~15.0.0)
- Update dependencies monthly (scheduled)
- Test after updates (full test suite)
```

## CONFIGURATION FILES REQUIRED
```
✅ tsconfig.json (strict mode)
✅ .eslintrc.json (with Next.js, TypeScript, a11y rules)
✅ .prettierrc (consistent formatting)
✅ .env.example (with all required keys)
✅ .gitignore (never commit .env, node_modules, .next)
✅ next.config.js (with security headers)
✅ tailwind.config.js (with design tokens)
✅ vitest.config.ts
✅ playwright.config.ts
```

---

**Last Updated:** 2025-12-29  
**Review Schedule:** Monthly or when adding major features
