# VALIDATION SCHEMAS v2.0
# Pre-built Zod schemas for common use cases
# Import from here to ensure consistency across the app

import { z } from "zod"

## ═══════════════════════════════════════════════════════════════════
## AUTHENTICATION & USER DATA
## ═══════════════════════════════════════════════════════════════════

### Email
export const emailSchema = z
  .string()
  .min(1, "Email required")
  .email("Invalid email format")
  .toLowerCase()
  .trim()

### Password (Strong)
export const passwordSchema = z
  .string()
  .min(12, "Minimum 12 characters")
  .max(100, "Maximum 100 characters")
  .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character (!@#$%^&*)")

### Name
export const nameSchema = z
  .string()
  .min(2, "Minimum 2 characters")
  .max(50, "Maximum 50 characters")
  .trim()
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Only letters, spaces, hyphens, and apostrophes allowed")

### Username (URL-safe)
export const usernameSchema = z
  .string()
  .min(3, "Minimum 3 characters")
  .max(30, "Maximum 30 characters")
  .toLowerCase()
  .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, underscores, and hyphens")

### Phone (International format)
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Format: +33612345678 (international)")

## ═══════════════════════════════════════════════════════════════════
## CONTENT & TEXT
## ═══════════════════════════════════════════════════════════════════

### Short Text (titles, subjects)
export const shortTextSchema = z
  .string()
  .min(1, "Required")
  .max(100, "Maximum 100 characters")
  .trim()

### Medium Text (descriptions, bios)
export const mediumTextSchema = z
  .string()
  .max(500, "Maximum 500 characters")
  .trim()

### Long Text (articles, posts)
export const longTextSchema = z
  .string()
  .max(10000, "Maximum 10,000 characters")
  .trim()

### URL
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .refine((url) => {
    try {
      const parsed = new URL(url)
      return ["http:", "https:"].includes(parsed.protocol)
    } catch {
      return false
    }
  }, "Only HTTP/HTTPS URLs allowed")

### Slug (URL-safe identifier)
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers, and hyphens (no spaces)")

## ═══════════════════════════════════════════════════════════════════
## NUMBERS & CURRENCY
## ═══════════════════════════════════════════════════════════════════

### Positive Integer
export const positiveIntSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive")

### Price (in cents, e.g., $10.99 = 1099)
export const priceSchema = z
  .number()
  .int("Price must be in cents")
  .nonnegative("Price cannot be negative")
  .max(99999999, "Price too large") // $999,999.99 max

### Percentage (0-100)
export const percentageSchema = z
  .number()
  .min(0, "Minimum 0%")
  .max(100, "Maximum 100%")

### Quantity
export const quantitySchema = z
  .number()
  .int()
  .min(1, "Minimum quantity: 1")
  .max(999, "Maximum quantity: 999")

## ═══════════════════════════════════════════════════════════════════
## DATES & TIME
## ═══════════════════════════════════════════════════════════════════

### Past Date (e.g., birth date)
export const pastDateSchema = z
  .string()
  .datetime()
  .refine((date) => new Date(date) < new Date(), "Date must be in the past")

### Future Date (e.g., event date)
export const futureDateSchema = z
  .string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), "Date must be in the future")

### Age (13-120)
export const ageSchema = z
  .number()
  .int()
  .min(13, "Must be at least 13 years old")
  .max(120, "Invalid age")

## ═══════════════════════════════════════════════════════════════════
## FILES & UPLOADS
## ═══════════════════════════════════════════════════════════════════

### Image Upload
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, "Max file size: 10MB")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Allowed formats: JPEG, PNG, WebP"
  )

### Document Upload (PDF)
export const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 25 * 1024 * 1024, "Max file size: 25MB")
  .refine((file) => file.type === "application/pdf", "Only PDF files allowed")

### Avatar Upload
export const avatarSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 2 * 1024 * 1024, "Max size: 2MB")
  .refine(
    (file) => ["image/jpeg", "image/png"].includes(file.type),
    "Only JPEG or PNG"
  )

## ═══════════════════════════════════════════════════════════════════
## BUSINESS-SPECIFIC
## ═══════════════════════════════════════════════════════════════════

### Credit Card (Never store raw, use for validation only)
export const creditCardSchema = z
  .string()
  .regex(/^\d{13,19}$/, "Invalid card number")
  .refine((num) => {
    // Luhn algorithm
    let sum = 0
    let isEven = false
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }, "Invalid card number (failed Luhn check)")

### CVV
export const cvvSchema = z
  .string()
  .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits")

### Postal Code (France)
export const postalCodeFRSchema = z
  .string()
  .regex(/^\d{5}$/, "Format: 75001")

### IBAN (Europe)
export const ibanSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, "Invalid IBAN format")
  .min(15)
  .max(34)

### SIRET (France - Company ID)
export const siretSchema = z
  .string()
  .regex(/^\d{14}$/, "SIRET must be 14 digits")

## ═══════════════════════════════════════════════════════════════════
## COMPOSED SCHEMAS (FOR FORMS)
## ═══════════════════════════════════════════════════════════════════

### Registration Form
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

### Login Form
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
})

### Update Profile Form
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  bio: mediumTextSchema.optional(),
  website: urlSchema.optional(),
  avatar: avatarSchema.optional(),
})

### Contact Form
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: shortTextSchema,
  message: longTextSchema,
})

### Address Form
export const addressSchema = z.object({
  street: z.string().min(5).max(100),
  city: z.string().min(2).max(50),
  postalCode: postalCodeFRSchema,
  country: z.enum(["FR", "BE", "CH", "LU"], {
    errorMap: () => ({ message: "Country not supported" }),
  }),
})

## ═══════════════════════════════════════════════════════════════════
## PAGINATION & FILTERING
## ═══════════════════════════════════════════════════════════════════

### Pagination Query Params
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
})

### Search Query
export const searchSchema = z.object({
  q: z.string().min(2, "Search term must be at least 2 characters").max(100),
  category: z.string().optional(),
  sortBy: z.enum(["recent", "popular", "price-asc", "price-desc"]).default("recent"),
})

## ═══════════════════════════════════════════════════════════════════
## USAGE EXAMPLES
## ═══════════════════════════════════════════════════════════════════

/**
 * IN API ROUTE:
 * 
 * import { registerSchema } from '@/lib/validation/schemas'
 * 
 * export async function POST(req: Request) {
 *   const body = await req.json()
 *   const result = registerSchema.safeParse(body)
 * 
 *   if (!result.success) {
 *     return NextResponse.json(
 *       { error: "Validation failed", details: result.error.format() },
 *       { status: 400 }
 *     )
 *   }
 * 
 *   const { email, password, name } = result.data
 *   // Safe to use: validated and typed
 * }
 */

/**
 * IN REACT HOOK FORM:
 * 
 * import { useForm } from 'react-hook-form'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import { loginSchema } from '@/lib/validation/schemas'
 * 
 * const form = useForm({
 *   resolver: zodResolver(loginSchema),
 * })
 */

---

**Last Updated:** 2025-12-29
**Add new schemas here as needed, keep them DRY and reusable**
