import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory store for development (when Upstash not configured)
class InMemoryRateLimit {
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
}

// Initialize Upstash or fallback
let redis: Redis | null = null
try {
    if (
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN &&
        !process.env.UPSTASH_REDIS_REST_URL.includes('your-redis-url') // Skip placeholder URLs
    ) {
        redis = Redis.fromEnv()
    }
} catch (error) {
    console.warn('[Rate Limit] Upstash Redis connection failed, using in-memory fallback')
    redis = null
}

// Rate limiters
export const loginRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
        analytics: true,
    })
    : null

export const registerRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 d'), // 3 registrations per day
        analytics: true,
    })
    : null

// In-memory fallback
const inMemoryLoginRateLimit = new InMemoryRateLimit()
const inMemoryRegisterRateLimit = new InMemoryRateLimit()

// Helper function to check rate limit
export async function checkRateLimit(
    type: 'login' | 'register',
    identifier: string
) {
    if (type === 'login') {
        if (loginRateLimit) {
            return await loginRateLimit.limit(identifier)
        }
        return await inMemoryLoginRateLimit.limit(identifier, 5, 15 * 60 * 1000)
    }

    if (type === 'register') {
        if (registerRateLimit) {
            return await registerRateLimit.limit(identifier)
        }
        return await inMemoryRegisterRateLimit.limit(identifier, 3, 24 * 60 * 60 * 1000)
    }

    throw new Error('Invalid rate limit type')
}
