# PROJECT STRUCTURE
*Last auto-updated: 2025-12-29*

This file is automatically maintained by the AI following the OMEGA PROTOCOL v2.0

---

## 📁 Directory Overview

```
/
├── .github/              # GitHub Actions workflows
│   └── workflows/        # CI/CD pipelines
├── .husky/               # Git hooks (pre-commit, pre-push)
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth-related routes (grouped)
│   ├── (marketing)/      # Public pages
│   ├── (dashboard)/      # Protected dashboard
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── architecture/         # 🧠 THE BRAIN (OMEGA Protocol docs)
│   ├── CONTEXT.md        # Business logic & rules
│   ├── STACK.md          # Technology constraints
│   ├── SECURITY.md       # Security protocols
│   ├── TESTING.md        # Testing strategy
│   ├── DEPLOYMENT.md     # DevOps procedures
│   ├── COMPLIANCE.md     # Legal requirements
│   ├── PERFORMANCE.md    # Optimization guidelines
│   └── VALIDATION_SCHEMAS.md  # Zod schemas
├── components/           # React components
│   ├── ui/               # Shadcn/UI base components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utilities & business logic
│   ├── db.ts             # Database client
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Shared utilities
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── project-docs/         # Generated documentation
│   ├── CHANGELOG.md      # What changed and when
│   ├── STRUCTURE.md      # This file
│   └── blueprints/       # Feature design docs
├── public/               # Static assets
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # API tests
│   └── e2e/              # Playwright E2E tests
├── tools/                # Automation scripts
│   └── check-secrets.sh  # Pre-commit security check
├── .cursorrules          # OMEGA Protocol rules
├── .env.example          # Environment template
└── package.json          # Dependencies
```

---

## 🗂️ Key Files

### Configuration
- `.cursorrules` - AI behavior rules (OMEGA Protocol v2.0)
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Design tokens
- `tsconfig.json` - TypeScript settings
- `.eslintrc.json` - Linting rules
- `vitest.config.ts` - Test configuration

### Architecture (THE BRAIN)
All files in `/architecture/` define how the AI should behave:
- `CONTEXT.md` - Business rules
- `STACK.md` - Tech stack constraints
- `SECURITY.md` - Security protocols
- Others listed above

---

## 📦 Component Organization (Atomic Design)

```
components/
├── ui/                   # Atoms (Button, Input, Card)
├── forms/                # Molecules (LoginForm, SearchBar)
├── sections/             # Organisms (Navbar, Footer)
└── layouts/              # Templates (DashboardLayout)
```

**Rule:** Reuse before creating. Check existing components first.

---

## 🔄 Data Flow

```
User Request
    ↓
API Route (app/api/)
    ↓
Validation (Zod schema from /architecture/VALIDATION_SCHEMAS.md)
    ↓
Business Logic (lib/)
    ↓
Database (Prisma)
    ↓
Response (JSON)
```

---

## 🧪 Testing Organization

```
tests/
├── unit/
│   ├── lib/              # Test utilities
│   └── components/       # Test UI components
├── integration/
│   └── api/              # Test API routes
└── e2e/
    └── flows/            # Test user journeys
```

---

## 📝 Documentation Flow

```
Code Change
    ↓
CI/CD Pipeline
    ↓
Update CHANGELOG.md (AI required)
    ↓
Update STRUCTURE.md (if files added/moved)
    ↓
Update Blueprint (if architecture changed)
```

---

## 🚫 What NOT to Commit

```
❌ .env (secrets)
❌ .env.local (local overrides)
❌ node_modules/
❌ .next/ (build output)
❌ coverage/ (test coverage)
❌ .DS_Store (macOS)
```

✅ **DO commit:**
- `.env.example` (template)
- `package-lock.json` (lock file)

---

## 🎯 File Naming Conventions

```
✅ GOOD:
- components/UserProfile.tsx (PascalCase for components)
- lib/formatCurrency.ts (camelCase for utilities)
- app/api/users/route.ts (kebab-case for routes)

❌ BAD:
- components/user_profile.tsx
- lib/FormatCurrency.ts
- app/api/Users/route.ts
```

---

**Auto-updated by OMEGA PROTOCOL**
*If this file is outdated, the AI has violated the Knowledge Sync rule.*
