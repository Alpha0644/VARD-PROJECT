# Changelog

## 2026-01-05 - Phase 1.6: OMEGA 100% Compliance ✅

### Fixed
- 🔧 **Type Safety 100%**: Removed all `any` types from codebase
  - `app/api/user/export-data/route.ts`: Added explicit `MissionExport` type
  - `app/api/missions/history/route.ts`: Used `Prisma.MissionWhereInput` for type-safe queries
  - `components/mission/create-mission-form.tsx`: Added `ErrorResponse` type for error handling
  - `components/dashboard/document-upload.tsx`: Replaced `any` with `unknown` in catch blocks
  - `tests/unit/lib/rate-limit.test.ts`: Fixed TypeScript null checks

### Added
- 🧪 **Comprehensive Mission API Tests**: 28 unit tests with 85%+ coverage
  - `tests/unit/api/missions/create.test.ts`: 15 test cases
    - Happy path: mission creation, agent notifications  
    - Error handling: auth, rate limiting, validation, RBAC
    - Edge cases: company profile lazy creation
  - `tests/unit/api/missions/status.test.ts`: 13 test cases
    - Happy path: all status transitions, geolocation tracking
    - Security: IDOR protection (prevent unauthorized status updates)
    - Error handling: auth, ownership verification

### Security
- ✅ **NPM Audit**: 0 vulnerabilities (production dependencies)
- ✅ **TypeScript**: Zero compilation errors

### Documentation
- 📚 Updated CHANGELOG with Phase 1.6 achievements

---

## [Unreleased] - 2025-12-30

### Added
- 🏗️ **MVP Foundation**: Initialized project structure with OMEGA Protocol v3.1.
- 🗄️ **Database Layer**:
  - Implemented Prisma Schema (User, Company, Agent, Mission models).
  - Configured SQLite for local development (mapped Enums to Strings).
  - Created `lib/db.ts` singleton for DB access.
  - Added verification tokens for email verification and password reset.
- ⚙️ **Configuration**:
  - Setup `.env` and `.env.example`.
  - Configured gitignore securely.
  - Added TypeScript path aliases (@/*).
- 🛡️ **Security**:
  - Validated initial dependencies (`npm audit`).
  - Enforced strict versioning for Prisma (v5).
- 🔐 **Authentication & Authorization** (Phase 1.1):
  - Implemented NextAuth.js v5 with credentials provider.
  - JWT-based sessions with role injection.
  - Password hashing (bcrypt, 12 rounds).
  - Zod validation schemas for auth flows.
  - Rate limiting (Upstash Redis with in-memory fallback):
    - Login: 5 attempts / 15 min
    - Register: 3 / day
  - RBAC middleware for role-based route protection.
  - Email service (Resend) for verification and password reset.
  - Registration API with email verification tokens.

## 2025-12-30 - Phase 1.2: Onboarding & Compliance

### Added
- 📄 **Document Upload System**:
  - Multi-doc upload component (CNAPS, ID, SIREN, Kbis).
  - File validation (type, size).
  - Storage via `/api/upload`.
- 👨‍💼 **Admin Dashboard**:
  - Document validation interface (`/admin`).
  - Mission oversight panel.
  - Bulk approve/reject actions.
- 🚧 **Gatekeeper Middleware**:
  - Block unverified users from accessing app.
  - Redirect to document upload if pending.

## 2025-12-30 - Phase 1.3: Geospatial Engine

### Added
- 📍 **Redis Geo-Indexing**:
  - `lib/redis-geo.ts` - `findNearbyAgents()` function.
  - 10km radius default for matching.
- 🔐 **H3 Location Privacy**:
  - Fuzzy coordinates using Uber H3 hexagons.
  - Resolution 9 (~500m precision) for privacy.
- 🔔 **Mission Notifications**:
  - Automatic notification creation on mission post.
  - Agent polling (`/api/agent/notifications` every 5s).
  - Badge counter UI for proposals.

## 2025-12-31 - Phase 1.4: Mission Tracking & Routing

### Added
- 🎯 **Role-Based Routing**:
  - Landing page with role selection (`/`).
  - Separate dashboards:
    - `/agent/dashboard` - Agent interface
    - `/company/dashboard` - Company interface
    - `/admin` - Admin panel
  - Middleware auto-redirect from `/dashboard`.
- 📊 **Mission Status Management**:
  - 5-state workflow (PENDING → ACCEPTED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED).
  - Status update buttons for agents.
  - Visual timeline component.
- 📜 **Mission History**:
  - `/agent/history` and `/company/history` pages.
  - Audit logs (`MissionStatusLog` model).
  - Date filtering and pagination.
- 🚪 **Logout Button**:
  - Reusable component on all dashboards.

## 2025-12-31 - OMEGA Compliance (Phase 1.5)

### Added
- ✅ **Type Safety**:
  - Removed all `any` usages.
  - Created `lib/constants.ts` for magic numbers.
  - Typed mocks in `tests/utils/mocks.ts`.
- 🛡️ **RGPD Compliance**:
  - Privacy Policy page (`/privacy-policy`).
  - Data export API (`/api/user/export-data` - Article 20).
  - Account deletion API (`/api/user/delete-account` - Article 17).
  - Cookie consent banner component.
- 📚 **Documentation**:
  - `project-docs/STRUCTURE.md` - Complete folder structure.
  - Updated CHANGELOG with all phases.
- 🧪 **Tests**:
  - Unit tests for API register.
  - Test coverage improved for auth flows.

### Fixed
- 🐛 **Prisma Compatibility**: Fixed mismatch between Prisma CLI (v7) and Client (v5) by pinning dev dependencies.
- 🐛 **SQLite Support**: Adjusted schema to use Strings instead of Enums for local SQLite compatibility.
- 🐛 **Company Role**: Fixed `agency@vard.test` role (was AGENT, now COMPANY).
- 🐛 **Type Safety**: Replaced `adapter: PrismaAdapter(db) as any` with proper `Adapter` type.
