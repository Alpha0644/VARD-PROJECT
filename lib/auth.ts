import NextAuth from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/features/auth/schemas'
import { AUTH_CONSTANTS } from '@/lib/constants'

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    adapter: PrismaAdapter(db) as Adapter,
    session: {
        strategy: 'jwt',
        maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate credentials
                const validatedFields = loginSchema.safeParse(credentials)

                if (!validatedFields.success) {
                    return null
                }

                const { email, password } = validatedFields.data

                // Find user
                const user = await db.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        passwordHash: true,
                        isVerified: true,
                    },
                })

                // Auth validation (no debug logs in production)
                if (!user) {

                    return null
                }
                if (!user.passwordHash) {

                    return null
                }

                // Verify password
                const isPasswordValid = await compare(password, user.passwordHash)


                if (!isPasswordValid) {
                    return null
                }

                // Return user (without password)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                }
            },
        }),
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            // After login, redirect to role-specific dashboard
            // The middleware will then handle the /dashboard → /role/dashboard routing
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith('/')) return `${baseUrl}${url}`
            return baseUrl + '/dashboard'
        },
        async jwt({ token, user }) {
            // Initial sign in - store user data in token
            if (user) {
                token.id = user.id
                token.role = user.role
                token.isVerified = user.isVerified
            }

            // On subsequent requests, refresh isVerified from database
            // This ensures the session updates after admin validates documents
            if (token.id) {
                const dbUser = await db.user.findUnique({
                    where: { id: token.id as string },
                    select: { isVerified: true }
                })
                if (dbUser) {
                    token.isVerified = dbUser.isVerified
                }
            }

            return token
        },
        async session({ session, token }) {
            // Add custom fields to session
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.isVerified = token.isVerified as boolean
            }
            return session
        },
    },
})
