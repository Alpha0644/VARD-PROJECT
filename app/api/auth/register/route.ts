import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/features/auth/schemas'
import { checkRateLimit } from '@/lib/rate-limit'
import { randomBytes } from 'crypto'

export async function POST(req: Request) {
    try {
        // Get IP for rate limiting
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

        // Rate limiting
        const { success, reset } = await checkRateLimit('register', ip)
        if (!success) {
            return NextResponse.json(
                { error: 'Trop de tentatives. Réessayez plus tard.' },
                {
                    status: 429,
                    headers: { 'X-RateLimit-Reset': new Date(reset).toISOString() },
                }
            )
        }

        // Parse and validate body
        const body = await req.json()
        const validatedFields = registerSchema.safeParse(body)

        if (!validatedFields.success) {
            // Validation handled by Zod schema
            return NextResponse.json(
                { error: 'Données invalides', details: validatedFields.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password, name, phone, role } = validatedFields.data

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Un compte avec cet email existe déjà' },
                { status: 409 }
            )
        }

        // Hash password
        const passwordHash = await hash(password, 12)

        // Generate verification token
        const verificationToken = randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Create user and profile in transaction
        const user = await db.user.create({
            data: {
                email,
                passwordHash,
                name,
                phone,
                role,
                isVerified: false,
                verificationToken,
                verificationTokenExpiry,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        })

        // Send verification email
        const { sendVerificationEmail } = await import('@/lib/email')
        await sendVerificationEmail(email, verificationToken)

        return NextResponse.json(
            {
                message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
                user,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur. Réessayez plus tard.' },
            { status: 500 }
        )
    }
}
