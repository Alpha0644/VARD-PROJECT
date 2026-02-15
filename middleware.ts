import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ============================================================================
// Rate Limiter Configuration
// ============================================================================
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.UPSTASH_REDIS_REST_URL.includes('your-redis-url'))
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, '10 s'),
        analytics: true,
    })
    : null

// ============================================================================
// Security Headers Helper - Applied to ALL responses
// ============================================================================
function addSecurityHeaders(response: NextResponse): NextResponse {
    // HSTS - Force HTTPS for 1 year
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Disable dangerous features
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()')

    // Additional hardening
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

    // CSP - Report-Only mode for safety (switch to enforce after testing)
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.pusher.com https://sockjs.pusher.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org",
        "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://*.supabase.co https://*.upstash.io",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ')
    response.headers.set('Content-Security-Policy', csp)

    return response
}

// ============================================================================
// Main Middleware
// ============================================================================
export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public routes (no auth required)
    const publicRoutes = ['/login', '/register', '/', '/privacy-policy', '/api/auth', '/api/upload', '/admin/login']

    // Rate Limiting (API Only)
    if (pathname.startsWith('/api') && ratelimit) {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const { success, limit, reset, remaining } = await ratelimit.limit(ip)

        if (!success) {
            return addSecurityHeaders(new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString()
                }
            }))
        }
    }

    if (publicRoutes.includes(pathname)) {
        return addSecurityHeaders(NextResponse.next())
    }

    // Protected routes - require authentication
    if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }

    // Role-based access control
    const role = session.user.role

    // Auto-redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
        if (role === 'AGENT') {
            return addSecurityHeaders(NextResponse.redirect(new URL('/agent/dashboard', request.url)))
        }
        if (role === 'COMPANY') {
            return addSecurityHeaders(NextResponse.redirect(new URL('/company/dashboard', request.url)))
        }
        if (role === 'ADMIN') {
            return addSecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)))
        }
    }

    // Agent-only routes
    if (pathname.startsWith('/agent') && role !== 'AGENT') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/unauthorized', request.url)))
    }

    // Company-only routes  
    if (pathname.startsWith('/company') && role !== 'COMPANY') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/unauthorized', request.url)))
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return addSecurityHeaders(NextResponse.redirect(new URL('/unauthorized', request.url)))
    }

    // Verification gatekeeper
    if (!session.user.isVerified) {
        const allowedPaths = ['/agent/dashboard', '/company/dashboard', '/dashboard', '/api/upload', '/api/auth']
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path))

        if (!isAllowed) {
            if (role === 'AGENT') {
                return addSecurityHeaders(NextResponse.redirect(new URL('/agent/dashboard', request.url)))
            }
            if (role === 'COMPANY') {
                return addSecurityHeaders(NextResponse.redirect(new URL('/company/dashboard', request.url)))
            }
            return addSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
    }

    return addSecurityHeaders(NextResponse.next())
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
