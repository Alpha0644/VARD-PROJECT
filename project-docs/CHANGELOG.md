# Changelog

## 2026-01-26 - Phase 4, 5 & 6: Feature Complete & OMEGA Audit 🚀

### Added
- 👮‍♂️ **Agent Dashboard (Job Board)**:
  - Created "Available Missions" view (`/agent/dashboard`).
  - Implemented mission acceptance flow with real-time updates.
  - "Active Mission" view with status toggle.

- 🏢 **Company Mission Details**:
  - Secure page `/company/missions/[id]`.
  - **Interactive Map** using Leaflet (Dynamic import).
  - **PDF Invoice Generation** client-side (`jspdf`).

- 🧠 **OMEGA Protocol Integration**:
  - Imported comprehensive configuration structure.
  - Applied `.antigravityrules`, `CONTEXT.md`.
  - Enforced strict architectural modes.

### Fixed
- 🐛 **Mission Acceptance Logic**: Corrected API strictness preventing agents from accepting pending missions.
- 🔧 **Map Placeholder**: Replaced static placeholder with functional Leaflet map.

### Security
- ✅ **Audit Phase 6 Passed**:
  - 0 Hardcoded secrets found.
  - 0 `any` types found in `app/` and `components/`.
  - Dependencies audited (esbuild monitored).

---

## 2026-01-20 - Phases 4: Landing Page Redesign 🎨

### Added
- 🎨 **Landing Page "Uber-like"**:
  - Nouveau Design System: Bleu Nuit (`#0A1628`) + Orange (`#FF6B35`)
  - Hero Section Split: Agent vs Entreprise avec CTA distincts
  - Animations: Scroll-fail, compteurs dynamiques, transitions
  - Composants modulaires: `Navbar`, `Hero`, `Stats`, `HowItWorks`, `Footer`
- 📱 **Responsive & SEO**:
  - Mobile-first design
  - Meta tags complets (OpenGraph, Twitter)
  - Lighthouse score optimisé

### Changed
- `app/globals.css`: Ajout variables CSS et animations custom
- `tailwind.config.ts`: Configuration complète du thème VARD

---

## 2026-01-20 - Refactoring: Email Module + Security Audit 🛠️

### Refactored
- 📧 **lib/email.ts** (517 lignes) → Modularisé en 7 fichiers:
  - `lib/email/config.ts` - Configuration Resend partagée
  - `lib/email/index.ts` - Exports barrel (compatibilité)
  - `lib/email/templates/verification.ts`
  - `lib/email/templates/password-reset.ts`
  - `lib/email/templates/welcome.ts`
  - `lib/email/templates/document-status.ts`
  - `lib/email/templates/mission-notification.ts`
  - `lib/email/templates/monthly-recap.ts`

### Security
- 🛡️ **Audit Avancé Phases 12-15** (Score: 100/100)
  - Phase 12: ReDoS protégé, pagination max 50
  - Phase 13: Supply chain secure, 0 shadow APIs
  - Phase 15: EXIF stripping implémenté (sharp)
- 🔒 **Headers HTTP renforcés**: HSTS, CSP, X-XSS-Protection
- 🧹 **Console.log nettoyés**: Supprimés en production

### Commits
- `ebef58d` - Pre-refactoring backup
- `29398a7` - Modularize lib/email.ts into 7 modules

---

## 2026-01-19 - Phase 3.2: GPS Live Tracking 📍

### Added
- 📍 **Live GPS Tracking**: Real-time agent position during missions
  - Backend: `POST /api/agent/location/live` (rate-limited, auth)
  - Redis: `updateAgentLiveLocation()`, `getAgentLiveLocation()`
  - Frontend (Agent): `useGeolocationTracker` hook + `LiveTrackingToggle`
  - Frontend (Company): `AgentMap` component with Leaflet
  - Page: `/company/missions/[id]` shows live agent position

### Modified  
- Pusher auth: Now supports `presence-mission-{id}` channels
- Rate limiter: Added `location` type (12 req/min)

### Dependencies
- Added: `leaflet`, `react-leaflet`, `@types/leaflet`

---

## 2026-01-19 - Phase 3.1: Real-time Notifications 🔔

### Added
- ⚡ **Pusher Integration**: Real-time mission notifications
  - Server: `lib/pusher.ts` singleton instance
  - Client: `lib/pusher-client.ts` with authEndpoint config
  - Auth: `/api/pusher/auth` for private channel security
  - Hook: `hooks/use-mission-notifications.ts`
  - UI: Toast notifications via Sonner (top-center, green)
  - Debug: `/agent/debug-pusher` diagnostic page

### Fixed
- 🔧 **Type Safety**: Removed all `any` types from Pusher code
  - Replaced with `unknown`, specific interfaces

### Security
- ✅ **OMEGA Audit**: 100% compliant
  - 0 `any` types
  - 0 npm vulnerabilities
  - 7-point security checklist passed

---

## 2026-01-17 - Phase 2.3: Production Deployment 🚀

### Added
- 🌐 **Vercel Production Deployment**:
  - URL: https://vardproject.vercel.app
  - CI/CD: GitHub → Vercel webhook actif
  - Environment variables configurées

- 📦 **Supabase Storage Integration**:
  - Document uploads now use Supabase Storage
  - Fixed `EROFS: read-only file system` error on Vercel
  - Fallback to local storage for development

- 🧪 **Vitest Mock Improvements**:
  - Created `lib/__mocks__/db.ts` for proper Prisma mocking
  - Removed all `as any` from test files (50+ → 0)
  - All 49 tests now pass

### Fixed
- 🐛 **Redis geosearch**: Replaced deprecated `georadius` with `geosearch` for Upstash
- 🐛 **Git Author Verification**: Fixed Vercel webhook rejecting commits
- 🐛 **Login tests**: Refactored to properly mock next-auth/react

### Monitoring & Security
- ✅ **Sentry Integration**: Added error tracking (Client/Server/Edge)
- ✅ **Vercel Analytics**: Audience tracking enabled
- ✅ **OMEGA Audit**: 100% compliant (7-point security checklist)
- ✅ No hardcoded secrets
- ✅ Rate limiting active

---

## 2026-01-14 - Phase 2: Production Infrastructure 🚀

### Added
- 🗄️ **Supabase PostgreSQL Migration**:
  - Migrated from SQLite to cloud PostgreSQL
  - Configured `directUrl` for Prisma migrations (PgBouncer compatibility)
  - Seeded production database with test accounts
  - Created blueprint: `project-docs/blueprints/supabase-migration.md`

- ⚡ **Upstash Redis Integration**:
  - Configured production Redis for rate limiting
  - Implemented persistent geolocation storage
  - Created `/api/agent/location/status` endpoint
  - Fixed Upstash `geopos` response format (object vs array)

- 🎯 **Location Persistence**:
  - Agent location now persists across server restarts
  - UI displays correct status after page refresh
  - Added location check on component mount

### Changed
- `prisma/schema.prisma`: Provider changed from `sqlite` to `postgresql`
- `lib/redis-geo.ts`: Added `getAgentLocation()` function
- `components/agent/location-simulator.tsx`: Added useEffect for status check

### Tags
- `phase2-complete` - Full infrastructure ready for Vercel deployment

---

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

## [Unreleased]
### Added
- **Phase 5: Dashboard Agent**
  - Initial mobile-first layout (TopBar, BottomNav).
  - `AgentMap` component with Leaflet in dark mode.
  - Floating status toggle placeholder.
- **Phase 4: Landing Page Redesign**
  - "Uber-like" aesthetic: Black & White theme, massive background imagery.
  - New sections: Stats, Feature Split, Quality Assurance, Download App.
  - Fully responsive, component-based architecture.

### Changed
- Refactored `app/page.tsx` to use new modular sections.
- Updated `middleware.ts` to allow static image assets. - 2025-12-30

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
