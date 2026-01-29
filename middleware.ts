import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple Edge-ready Rate Limiter initialization
// We redefine it here because importing from lib/rate-limit.ts might cause issues with non-edge dependencies
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.UPSTASH_REDIS_REST_URL.includes('your-redis-url'))
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds
        analytics: true,
    })
    : null

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public routes (no auth required)
    const publicRoutes = ['/login', '/register', '/', '/privacy-policy', '/api/auth', '/api/upload', '/admin/login']

    // Rate Limiting (API Only)
    if (pathname.startsWith('/api') && ratelimit) {
        // Use X-Forwarded-For or Fallback to '127.0.0.1'
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const { success, limit, reset, remaining } = await ratelimit.limit(ip)

        if (!success) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString()
                }
            })
        }
    }

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    // Protected routes - require authentication
    if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Role-based access control
    const role = session.user.role
    console.log(`[Middleware] Redirect Logic - User: ${session.user.email}, Role: ${role}, Path: ${request.nextUrl.pathname}`)

    // Auto-redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
        if (role === 'AGENT') {
            return NextResponse.redirect(new URL('/agent/dashboard', request.url))
        }
        if (role === 'COMPANY') {
            return NextResponse.redirect(new URL('/company/dashboard', request.url))
        }
        if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // Agent-only routes
    if (pathname.startsWith('/agent') && role !== 'AGENT') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Company-only routes  
    if (pathname.startsWith('/company') && role !== 'COMPANY') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Check if user is verified (Gatekeeper)
    // Allow verified paths for each role
    if (!session.user.isVerified) {
        const allowedPaths = [
            '/agent/dashboard',
            '/company/dashboard',
            '/dashboard',
            '/api/upload',
            '/api/auth'
        ]
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path))

        if (!isAllowed) {
            // Redirect to role-specific dashboard for document upload
            if (role === 'AGENT') {
                return NextResponse.redirect(new URL('/agent/dashboard', request.url))
            }
            if (role === 'COMPANY') {
                return NextResponse.redirect(new URL('/company/dashboard', request.url))
            }
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
