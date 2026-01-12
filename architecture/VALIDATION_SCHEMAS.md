# Validation Schemas Documentation

This document catalogs all Zod validation schemas used in the VARD platform for input validation.

## 📋 Auth Schemas

### Location
`features/auth/schemas.ts`

### Login Schema
```typescript
loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
```

**Usage**: `/api/auth/[...nextauth]` (credentials provider)

**Validates**:
- Email format (RFC 5322)
- Non-empty password

---

### Register Schema
```typescript
registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  name: z.string().min(2, 'Nom requis'),
  role: z.enum(['AGENT', 'COMPANY'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
})
```

**Usage**: `/api/auth/register`

**Validates**:
- Strong password policy
- User role (AGENT or COMPANY only)
- Non-empty name

---

## 🎯 Mission Schemas

### Location
`app/api/missions/route.ts`

### Create Mission Schema
```typescript
createMissionSchema = z.object({
  title: z.string().min(5, 'Titre min 5 caractères'),
  description: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  location: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  requirements: z.array(z.string()).optional(),
})
```

**Usage**: `POST /api/missions`

**Validates**:
- Title length (min 5 chars)
- Valid coordinates (lat/lng bounds)
- Date transformation (ISO string → Date object)

**Custom Logic**:
- `startTime` must be before `endTime` (add if needed)

---

## 🗑️ RGPD Schemas

### Location
`app/api/user/delete-account/route.ts`

### Delete Account Schema
```typescript
deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Tapez DELETE pour confirmer' }),
  }),
})
```

**Usage**: `DELETE /api/user/delete-account`

**Validates**:
- Password provided
- Exact string match: "DELETE" (safety confirmation)

---

## 🎨 Best Practices

### 1. Error Messages in French
All error messages use French for user-facing validation.

### 2. Transform vs Parse
- **Parse**: Validation only (`safeParse()`)
- **Transform**: Convert types during validation (e.g., string → Date)

### 3. Custom Error Maps
Use `errorMap` for enum validation to provide clear messages.

### 4. Reusable Schemas
Extract common sub-schemas to avoid duplication:
```typescript
const emailSchema = z.string().email()
const passwordSchema = z.string().min(8)

// Reuse
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
```

---

## 🔒 Security Considerations

### 1. Never Trust Client Input
ALL external inputs (API body, query params, FormData) must be validated with Zod.

### 2. Sanitization After Validation
Zod validates **structure**, not **content safety**. For HTML/SQL, sanitize separately:
```typescript
import { sanitize } from 'dompurify' // For HTML
const cleanTitle = sanitize(validated.data.title)
```

### 3. File Upload Validation
For file uploads, validate:
- MIME type (not just extension)
- File size
- Filename (alphaumeric + extension only)

Example:
```typescript
const fileSchema = z.object({
  type: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  size: z.number().max(10 * 1024 * 1024), // 10MB
  name: z.string().regex(/^[\w\-. ]+$/), // Safe chars only
})
```

---

## 🧪 Testing Schemas

### Unit Test Pattern
```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/features/auth/schemas'

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })
})
```

---

## 📚 Resources

- **Zod Docs**: https://zod.dev
- **Zod Error Handling**: https://zod.dev/ERROR_HANDLING
- **OWASP Input Validation**: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

---

*Last Updated: 2025-12-31 (Phase 1.5 - OMEGA Compliance)*
