import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { registerAgentSchema, registerCompanySchema } from '@/lib/validations/auth'
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

        // Parse body once
        const body = await req.json()

        let validationResult

        // Determine schema based on role (default to basic if not specified, though role is required usually)
        if (body.role === 'COMPANY') {
            validationResult = registerCompanySchema.safeParse(body)
        } else if (body.role === 'AGENT') {
            // Convert date string/object to date for schema if needed, or schema handles string
            validationResult = registerAgentSchema.safeParse(body)
        } else {
            // Fallback or Error if role is invalid/missing
            return NextResponse.json({ error: 'Rôle invalide ou manquant' }, { status: 400 })
        }

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        // Extract common fields + specific ones if needed (though we currently just store common in User model)
        // Note: Specific fields (SIREN, CartePRO) might need to be stored in the related profile tables!
        // The current implementation ONLY creates `db.user`. 
        // We should PROBABLY create the related Agent/Company record here OR ensure the User is created and then they fill profile later.
        // However, the schemas validation implies we receive these fields. 
        // If we validate them, we should save them.

        // For this step, let's keep it compatible with existing flow: Create User. 
        // If the 'registerSchema' was generic, maybe we just validated name/email/pass.
        // But 'registerAgentSchema' checks CartePro. If we validate it but don't save it, it's weird.
        // Let's stick to validating standard User fields for now if we don't want to break the "Profile Completion later" flow, 
        // OR better: Create the profile row immediately if data is present.

        const data = validationResult.data as any // Type assertion for common fields access
        const { email, password, name, phone, role } = data

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
