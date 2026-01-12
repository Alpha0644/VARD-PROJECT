# Project Structure

## Root Directory
```
IATRAVAIL/
├── app/                    # Next.js App Router
├── components/             # React Components
├── lib/                    # Core Business Logic
├── features/               # Feature Modules
├── architecture/           # Architecture Documentation
├── project-docs/           # Project Documentation
├── tests/                  # Test Suites
├── prisma/                 # Database Schema & Migrations
├── scripts/                # Utility Scripts
└── tools/                  # Development Tools
```

---

## `/app` - Next.js Routes

### Authentication Routes
- `app/(auth)/login/` - Login page
- `app/(auth)/register/` - Registration page
- `app/(auth)/verify-email/` - Email verification handler

### Role-Specific Dashboards
- `app/agent/dashboard/` - Agent dashboard (missions, proposals, location)
- `app/agent/history/` - Agent mission history
- `app/company/dashboard/` - Company dashboard (create missions, upload docs)
- `app/company/history/` - Company mission archives
- `app/admin/` - Admin panel (document validation, mission oversight)

### Public Pages
- `app/page.tsx` - Landing page (role selection)
- `app/privacy-policy/` - RGPD Privacy Policy

### API Routes
- `app/api/auth/[...nextauth]/` - NextAuth.js handler
- `app/api/auth/register/` - User registration
- `app/api/missions/` - Mission CRUD
- `app/api/missions/history/` - Mission history paginated
- `app/api/missions/[id]/logs/` - Mission audit logs
- `app/api/agent/notifications/` - Agent mission notifications  
- `app/api/agent/location/` - Update agent geolocation
- `app/api/upload/` - Document upload
- `app/api/admin/documents/` - Admin document validation
- `app/api/user/export-data/` - RGPD data export
- `app/api/user/delete-account/` - RGPD account deletion

---

## `/components` - React Components

### By Feature
```
components/
├── auth/
│   └── logout-button.tsx          # Logout UI
├── agent/
│   ├── active-mission.tsx         # Current mission w/ status controls
│   ├── mission-proposals.tsx      # Incoming notifications
│   └── location-simulator.tsx     # Dev tool for geolocation
├── mission/
│   ├── create-mission-form.tsx    # Company mission creation
│   ├── mission-timeline.tsx       # Visual status progression
│   └── mission-history-list.tsx   # List completed missions
├── admin/
│   ├── admin-document-list.tsx    # Document validation UI
│   └── admin-mission-list.tsx     # Mission oversight
├── dashboard/
│   └── document-upload.tsx        # Multi-doc upload (CNAPS, Kbis)
└── gdpr/
    └── cookie-banner.tsx          # RGPD cookie consent
```

---

## `/lib` - Core Logic

### Files
- `lib/auth.ts` - NextAuth configuration
- `lib/db.ts` - Prisma client singleton
- `lib/documents.ts` - Document validation logic
- `lib/email.ts` - Resend email service
- `lib/rate-limit.ts` - Upstash Redis rate limiting
- `lib/redis-geo.ts` - Geospatial matching (H3 + Redis)
- `lib/constants.ts` - Application constants (OMEGA compliance)

### `/lib/types`
- `lib/types/mission.ts` - Mission type definitions

---

## `/features` - Feature Modules

### Auth Feature
```
features/auth/
├── schemas.ts              # Zod validation (login, register)
└── actions/
    └── (future server actions)
```

---

## `/architecture` - Documentation

### Files
- `CONTEXT.md` - Business context & requirements
- `STACK.md` - Tech stack constraints
- `SECURITY.md` - Security guidelines
- `TESTING.md` - Test templates & standards
- `VALIDATION_SCHEMAS.md` - Zod schema documentation
- `PERFORMANCE.md` - Performance benchmarks
- `DEPLOYMENT.md` - Deployment checklist
- `COMPLIANCE.md` - RGPD/PCI-DSS compliance

---

## `/project-docs` - Project Docs

### Files
- `CHANGELOG.md` - Version history
- `STRUCTURE.md` - This file
- `blueprints/` - Design documents
  - `auth-flow.md`
  - `mission-flow.md`
  - `admin-workflow.md`

---

## `/tests` - Test Suites

### Structure
```
tests/
├── unit/
│   ├── api/
│   │   ├── auth/
│   │   │   └── register.test.ts
│   │   └── history.test.ts
│   ├── auth/
│   │   └── schemas.test.ts
│   └── lib/
│       └── rate-limit.test.ts
├── e2e/
│   └── auth.spec.ts
├── utils/
│   └── mocks.ts                 # Typed mock utilities
└── setup.ts
```

---

## `/prisma` - Database

- `schema.prisma` - Data models (User, Agent, Company, Mission, etc.)
- `seed.js` - Test data seeder
- `/migrations` - Database migrations (if Postgres)

---

## `/scripts` - Utility Scripts

### Files
- `approve-docs.js` - Mass-approve pending documents
- `create-test-history.js` - Generate completed missions
- `fix-company-role.js` - Fix user roles
- `force-verified.js` - Bypass verification for testing
- `debug-routing.js` - Diagnostic routing issues
- `verify-all.ts` - TypeScript version of approve-docs

---

## `/tools` - Dev Tools

- `auto-backup.ps1` - Automated backups (PowerShell)
- `restore-backup.ps1` - Restore from backup

---

## Key Design Patterns

### Route Protection
- `middleware.ts` - Centralized auth & RBAC enforcement
- Auto-redirect `/dashboard` → role-specific dashboards

### Type Safety
- All `any` usage eliminated (OMEGA compliance)
- Zod schemas for external inputs
- Typed mocks in tests

### State Management
- Server Components by default
- Client Components (`'use client'`) only when needed
- No global state library (yet)

### Error Handling
- Try/catch on all async operations
- User-friendly error messages
- Detailed logs for debugging

---

**Last Updated**: 2025-12-31 (Phase 1.4 Complete)
