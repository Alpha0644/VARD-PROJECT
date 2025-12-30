import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/features/auth/schemas'

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
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

                if (!user || !user.passwordHash) {
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
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id
                token.role = user.role
                token.isVerified = user.isVerified
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
