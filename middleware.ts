import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public routes (no auth required)
    const publicRoutes = ['/login', '/register', '/', '/privacy-policy', '/api/auth', '/api/upload']
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
