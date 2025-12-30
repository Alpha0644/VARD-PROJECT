# Changelog

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

### Fixed
- 🐛 **Prisma Compatibility**: Fixed mismatch between Prisma CLI (v7) and Client (v5) by pinning dev dependencies.
- 🐛 **SQLite Support**: Adjusted schema to use Strings instead of Enums for local SQLite compatibility.
