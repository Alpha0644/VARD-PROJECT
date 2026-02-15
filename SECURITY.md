# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within VARD, please contact us immediately at **security@vard.fr**.

**Do NOT** open a public GitHub issue for security vulnerabilities.

### What to include:
- A description of the vulnerability
- Steps to reproduce the issue
- Impact assessment (if possible)

### Response Timeline:
- **Acknowledgement:** Within 24 hours
- **Initial Assessment:** Within 48 hours
- **Resolution:** Critical issues within 7 days

## Security Measures

This application implements:
- **Authentication:** JWT-based sessions via Auth.js v5 with bcrypt password hashing (cost factor 12)
- **Authorization:** Role-based access control (RBAC) enforced at middleware and API route level
- **Rate Limiting:** Upstash Redis-backed rate limiting on all API endpoints
- **Input Validation:** Zod schema validation on all user inputs
- **Security Headers:** HSTS, CSP (enforced), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **EXIF Stripping:** All uploaded images are processed through Sharp to remove metadata (GPS, camera info)
- **Error Monitoring:** Sentry integration for real-time error tracking
- **RGPD Compliance:** Right to erasure (account deletion with cascade), data export

## Dependency Management

Dependencies are regularly audited with `npm audit`. Only production-safe packages are used.
