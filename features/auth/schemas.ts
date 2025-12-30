import { z } from 'zod'

// Password validation (min 8 chars, 1 uppercase, 1 number)
const passwordSchema = z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')

// Email validation
const emailSchema = z
    .string()
    .email('Email invalide')
    .toLowerCase()
    .trim()

// Register Schema
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
    phone: z.string().optional(),
    role: z.enum(['AGENT', 'COMPANY'], {
        required_error: 'Le rôle est obligatoire',
    }),
})

export type RegisterInput = z.infer<typeof registerSchema>

// Login Schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Le mot de passe est obligatoire'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Password Reset Request Schema
export const resetPasswordRequestSchema = z.object({
    email: emailSchema,
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

// Password Reset Schema
export const resetPasswordSchema = z.object({
    token: z.string(),
    password: passwordSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Email Verification Schema
export const verifyEmailSchema = z.object({
    token: z.string(),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
