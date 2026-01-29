
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

// Use a global instance to avoid "too many connections" in dev, though less relevant for this one-off script
const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Simple protection
    if (secret !== 'omega-deploy-2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('🔄 Starting Admin Setup...')
        const passwordHash = await hash('password123', 12)

        // Create Admin
        const admin = await prisma.user.upsert({
            where: { email: 'admin@vard.test' },
            update: {
                passwordHash,
                role: 'ADMIN',
                isVerified: true
            },
            create: {
                email: 'admin@vard.test',
                name: 'Admin VARD',
                passwordHash,
                role: 'ADMIN',
                isVerified: true,
                image: null,
            },
        })

        console.log('✅ Admin Setup Complete')

        return NextResponse.json({
            success: true,
            message: 'Admin user created/updated successfully',
            user: {
                email: admin.email,
                role: admin.role
            }
        })

    } catch (error: any) {
        console.error('❌ Admin Setup Failed:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
