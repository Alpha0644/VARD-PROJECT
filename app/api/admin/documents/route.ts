
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sendDocumentApprovedEmail, sendDocumentRejectedEmail } from '@/lib/email'

// Schema for status update
const updateDocumentSchema = z.object({
    id: z.string(),
    status: z.enum(['VERIFIED', 'REJECTED']),
    reason: z.string().optional(), // Rejection reason
})

export async function GET(req: Request) {
    try {
        const session = await auth()

        // 1. Security: Auth & Role Check
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // 2. Fetch Pending Documents with User details
        const documents = await db.document.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(documents)
    } catch (error) {
        // 3. Error Handling: No console.log, generic message
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        // 1. Security: Auth & Role Check
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await req.json()

        // 2. Input Validation (Zod)
        const validated = updateDocumentSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { id, status, reason } = validated.data

        // 3. Update Database with user email
        const document = await db.document.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: { email: true }
                }
            }
        })

        // 4. Send email notification
        if (document.user?.email) {
            if (status === 'VERIFIED') {
                await sendDocumentApprovedEmail(document.user.email, document.type)
            } else if (status === 'REJECTED') {
                await sendDocumentRejectedEmail(document.user.email, document.type, reason)
            }
        }

        // 5. Post-Update Logic: Check if user is fully verified
        // If the user has all required documents verified, update user.isVerified
        const userDocs = await db.document.findMany({
            where: { userId: document.userId }
        })

        const user = await db.user.findUnique({
            where: { id: document.userId },
            select: { role: true }
        })

        if (user) {
            let requiredTypes: string[] = []
            if (user.role === 'AGENT') {
                requiredTypes = ['CNAPS', 'ID_CARD']
            } else if (user.role === 'COMPANY') {
                requiredTypes = ['SIREN_FIRM']
            }

            const allVerified = requiredTypes.every(type =>
                userDocs.some(d => d.type === type && d.status === 'VERIFIED')
            )

            if (allVerified) {
                await db.user.update({
                    where: { id: document.userId },
                    data: { isVerified: true }
                })
            }
        }

        return NextResponse.json(document)

    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
