/**
 * OMEGA Protocol v3.0 - Authentication Schema Tests
 * Coverage Target: 100% (Critical Path)
 * Test Strategy: Unit Testing - Zod Validation Schemas
 */

import { describe, it, expect } from 'vitest'
import {
    registerSchema,
    loginSchema,
    resetPasswordRequestSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    type RegisterInput,
    type LoginInput,
} from '@/features/auth/schemas'

describe('🔐 registerSchema (OMEGA: Critical Auth Path)', () => {
    // Happy Path Tests
    describe('✅ Valid Inputs', () => {
        it('accepts valid AGENT registration', () => {
            const validInput = {
                email: 'agent@omega.test',
                password: 'SecurePass123',
                name: 'Test Agent',
                phone: '+33612345678',
                role: 'AGENT' as const,
            }

            const result = registerSchema.safeParse(validInput)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe('agent@omega.test') // lowercase enforced
                expect(result.data.role).toBe('AGENT')
            }
        })

        it('accepts valid COMPANY registration', () => {
            const validInput = {
                email: 'company@omega.test',
                password: 'CompanyPass2024',
                name: 'OMEGA Security Corp',
                role: 'COMPANY' as const,
            }

            const result = registerSchema.safeParse(validInput)

            expect(result.success).toBe(true)
        })

        it('trims and lowercases email', () => {
            const input = {
                email: '  USER@OMEGA.TEST  ',
                password: 'ValidPass123',
                name: 'Test User',
                role: 'AGENT' as const,
            }

            const result = registerSchema.safeParse(input)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe('user@omega.test')
            }
        })

        it('accepts optional phone field', () => {
            const inputWithoutPhone = {
                email: 'test@omega.test',
                password: 'ValidPass123',
                name: 'Test User',
                role: 'AGENT' as const,
            }

            const result = registerSchema.safeParse(inputWithoutPhone)

            expect(result.success).toBe(true)
        })
    })

    // Security - Password Validation Tests
    describe('🔒 Password Security Rules', () => {
        const baseInput = {
            email: 'test@omega.test',
            name: 'Test User',
            role: 'AGENT' as const,
        }

        it('rejects password shorter than 8 characters', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                password: 'Short1',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('au moins 8 caractères')
            }
        })

        it('rejects password without uppercase letter', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                password: 'lowercase123',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('majuscule')
            }
        })

        it('rejects password without number', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                password: 'NoNumberHere',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('chiffre')
            }
        })

        it('accepts password with all requirements', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                password: 'SecurePass123!@#',
            })

            expect(result.success).toBe(true)
        })
    })

    // Email Validation Tests
    describe('📧 Email Validation', () => {
        const baseInput = {
            password: 'ValidPass123',
            name: 'Test User',
            role: 'AGENT' as const,
        }

        it('rejects invalid email format', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                email: 'not-an-email',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Email invalide')
            }
        })

        it('rejects empty email', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                email: '',
            })

            expect(result.success).toBe(false)
        })
    })

    // Name Validation Tests
    describe('👤 Name Validation', () => {
        const baseInput = {
            email: 'test@omega.test',
            password: 'ValidPass123',
            role: 'AGENT' as const,
        }

        it('rejects name shorter than 2 characters', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                name: 'A',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('au moins 2 caractères')
            }
        })

        it('rejects name longer than 100 characters', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                name: 'A'.repeat(101),
            })

            expect(result.success).toBe(false)
        })
    })

    // Role Validation Tests
    describe('🎭 Role Validation', () => {
        const baseInput = {
            email: 'test@omega.test',
            password: 'ValidPass123',
            name: 'Test User',
        }

        it('rejects missing role', () => {
            const result = registerSchema.safeParse(baseInput)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('rôle est obligatoire')
            }
        })

        it('rejects invalid role', () => {
            const result = registerSchema.safeParse({
                ...baseInput,
                role: 'ADMIN', // Not allowed in registration
            })

            expect(result.success).toBe(false)
        })

        it('accepts only AGENT or COMPANY roles', () => {
            const agentResult = registerSchema.safeParse({
                ...baseInput,
                role: 'AGENT',
            })
            const companyResult = registerSchema.safeParse({
                ...baseInput,
                role: 'COMPANY',
            })

            expect(agentResult.success).toBe(true)
            expect(companyResult.success).toBe(true)
        })
    })
})

describe('🔐 loginSchema (OMEGA: Critical Auth Path)', () => {
    it('accepts valid login credentials', () => {
        const result = loginSchema.safeParse({
            email: 'test@omega.test',
            password: 'anyPassword',
        })

        expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
        const result = loginSchema.safeParse({
            email: 'invalid-email',
            password: 'password',
        })

        expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
        const result = loginSchema.safeParse({
            email: 'test@omega.test',
            password: '',
        })

        expect(result.success).toBe(false)
    })

    it('lowercases and trims email', () => {
        const result = loginSchema.safeParse({
            email: '  TEST@OMEGA.TEST  ',
            password: 'password',
        })

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.email).toBe('test@omega.test')
        }
    })
})

describe('🔄 resetPasswordRequestSchema', () => {
    it('accepts valid email', () => {
        const result = resetPasswordRequestSchema.safeParse({
            email: 'test@omega.test',
        })

        expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
        const result = resetPasswordRequestSchema.safeParse({
            email: 'invalid',
        })

        expect(result.success).toBe(false)
    })
})

describe('🔑 resetPasswordSchema', () => {
    it('accepts valid token and password', () => {
        const result = resetPasswordSchema.safeParse({
            token: 'valid-reset-token-12345',
            password: 'NewSecurePass123',
        })

        expect(result.success).toBe(true)
    })

    it('rejects weak password', () => {
        const result = resetPasswordSchema.safeParse({
            token: 'valid-token',
            password: 'weak',
        })

        expect(result.success).toBe(false)
    })
})

describe('✉️ verifyEmailSchema', () => {
    it('accepts valid token', () => {
        const result = verifyEmailSchema.safeParse({
            token: 'verification-token-abc123',
        })

        expect(result.success).toBe(true)
    })

    it('rejects missing token', () => {
        const result = verifyEmailSchema.safeParse({})

        expect(result.success).toBe(false)
    })
})
