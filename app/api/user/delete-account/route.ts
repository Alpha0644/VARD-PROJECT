import { NextResponse } from 'next/server'
import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { logAuth, logError } from '@/lib/logger'

const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Mot de passe requis'),
    confirmation: z.literal('DELETE', {
        errorMap: () => ({ message: 'Tapez DELETE pour confirmer' }),
    }),
})

/**
 * RGPD Article 17 - Right to Erasure
 * Delete user account and all associated data
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await req.json()
        const validated = deleteAccountSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validated.error.flatten() },
                { status: 400 }
            )
        }

        const userId = session.user.id

        // Verify password for security
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        })

        if (!user?.passwordHash) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
        }

        const isPasswordValid = await compare(validated.data.password, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
        }

        // Check for active missions (BLOCKER)
        const activeMissions = await db.mission.findFirst({
            where: {
                OR: [
                    { agentId: userId, status: { in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] } },
                    { companyId: userId, status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] } },
                ],
            },
        })

        if (activeMissions) {
            return NextResponse.json(
                {
                    error: 'Vous avez des missions en cours',
                    message: 'Veuillez terminer ou annuler vos missions actives avant de supprimer votre compte',
                },
                { status: 409 }
            )
        }

        // Perform deletion (Prisma cascade handles related records)
        await db.user.delete({
            where: { id: userId },
        })

        logAuth('delete-account', userId, true)

        // Invalidate session
        await signOut({ redirect: false })

        return NextResponse.json(
            {
                success: true,
                message: 'Votre compte a été supprimé',
            },
            { status: 200 }
        )
    } catch (error) {
        logError(error, { context: 'delete-account' })
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du compte' },
            { status: 500 }
        )
    }
}

