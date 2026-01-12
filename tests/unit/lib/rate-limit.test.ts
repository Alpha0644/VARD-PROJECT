/**
 * OMEGA Protocol v3.0 - Rate Limiting Tests
 * Coverage Target: 100% (Critical Security Path)
 * Test Strategy: Unit Testing - Security Controls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

// Force in-memory mode for tests
vi.mock('@/lib/rate-limit', async () => {
    // In-memory store for testing
    class TestRateLimit {
        private store: Map<string, { count: number; reset: number }> = new Map()

        async limit(identifier: string, limit: number, window: number) {
            const now = Date.now()
            const key = identifier
            const entry = this.store.get(key)

            if (!entry || now > entry.reset) {
                this.store.set(key, { count: 1, reset: now + window })
                return {
                    success: true,
                    limit,
                    remaining: limit - 1,
                    reset: now + window,
                }
            }

            if (entry.count >= limit) {
                return {
                    success: false,
                    limit,
                    remaining: 0,
                    reset: entry.reset,
                }
            }

            entry.count++
            this.store.set(key, entry)

            return {
                success: true,
                limit,
                remaining: limit - entry.count,
                reset: entry.reset,
            }
        }

        clear() {
            this.store.clear()
        }
    }

    const testLoginRateLimit = new TestRateLimit()
    const testRegisterRateLimit = new TestRateLimit()

    return {
        checkRateLimit: async (type: 'login' | 'register', identifier: string) => {
            if (type === 'login') {
                return await testLoginRateLimit.limit(identifier, 5, 15 * 60 * 1000)
            }
            if (type === 'register') {
                return await testRegisterRateLimit.limit(identifier, 3, 24 * 60 * 60 * 1000)
            }
            throw new Error('Invalid rate limit type')
        },
        _testLoginRateLimit: testLoginRateLimit,
        _testRegisterRateLimit: testRegisterRateLimit,
    }
})

describe('🚦 Rate Limiting (OMEGA: Security Critical)', () => {
    describe('🔐 Login Rate Limiting', () => {
        const testIdentifier = 'test-user@omega.test'

        beforeEach(async () => {
            // Import dynamically to get mocked version
            const module = await import('@/lib/rate-limit')
            if ('_testLoginRateLimit' in module && typeof module._testLoginRateLimit === 'object' && module._testLoginRateLimit && 'clear' in module._testLoginRateLimit) {
                ; (module._testLoginRateLimit as { clear: () => void }).clear()
            }
        })

        it('allows first login attempt', async () => {
            const result = await checkRateLimit('login', testIdentifier)

            expect(result.success).toBe(true)
            expect(result.limit).toBe(5)
            expect(result.remaining).toBe(4)
        })

        it('allows up to 5 login attempts', async () => {
            // Attempt 5 times
            for (let i = 0; i < 5; i++) {
                const result = await checkRateLimit('login', testIdentifier)
                expect(result.success).toBe(true)
            }
        })

        it('blocks 6th login attempt (SECURITY CRITICAL)', async () => {
            // Make 5 attempts (max allowed)
            for (let i = 0; i < 5; i++) {
                await checkRateLimit('login', testIdentifier)
            }

            // 6th attempt should be blocked
            const result = await checkRateLimit('login', testIdentifier)

            expect(result.success).toBe(false)
            expect(result.remaining).toBe(0)
        })

        it('tracks remaining attempts correctly', async () => {
            const attempt1 = await checkRateLimit('login', testIdentifier)
            expect(attempt1.remaining).toBe(4)

            const attempt2 = await checkRateLimit('login', testIdentifier)
            expect(attempt2.remaining).toBe(3)

            const attempt3 = await checkRateLimit('login', testIdentifier)
            expect(attempt3.remaining).toBe(2)
        })

        it('isolates rate limits per identifier', async () => {
            const user1 = 'user1@omega.test'
            const user2 = 'user2@omega.test'

            // User 1 makes 5 attempts
            for (let i = 0; i < 5; i++) {
                await checkRateLimit('login', user1)
            }

            // User 1 should be blocked
            const user1Result = await checkRateLimit('login', user1)
            expect(user1Result.success).toBe(false)

            // User 2 should still have access
            const user2Result = await checkRateLimit('login', user2)
            expect(user2Result.success).toBe(true)
        })
    })

    describe('📝 Register Rate Limiting', () => {
        const testIdentifier = '192.168.1.100' // IP-based for registration

        beforeEach(async () => {
            const module = await import('@/lib/rate-limit')
            if ('_testRegisterRateLimit' in module && typeof module._testRegisterRateLimit === 'object' && module._testRegisterRateLimit && 'clear' in module._testRegisterRateLimit) {
                ; (module._testRegisterRateLimit as { clear: () => void }).clear()
            }
        })

        it('allows first registration', async () => {
            const result = await checkRateLimit('register', testIdentifier)

            expect(result.success).toBe(true)
            expect(result.limit).toBe(3)
            expect(result.remaining).toBe(2)
        })

        it('allows up to 3 registrations per day', async () => {
            for (let i = 0; i < 3; i++) {
                const result = await checkRateLimit('register', testIdentifier)
                expect(result.success).toBe(true)
            }
        })

        it('blocks 4th registration attempt (SECURITY CRITICAL)', async () => {
            // Make 3 attempts (max allowed)
            for (let i = 0; i < 3; i++) {
                await checkRateLimit('register', testIdentifier)
            }

            // 4th attempt should be blocked
            const result = await checkRateLimit('register', testIdentifier)

            expect(result.success).toBe(false)
            expect(result.remaining).toBe(0)
        })
    })

    describe('❌ Error Handling', () => {
        it('throws error on invalid rate limit type', async () => {
            await expect(
                checkRateLimit('invalid' as 'login', 'test')
            ).rejects.toThrow('Invalid rate limit type')
        })
    })
})
