import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { logError } from '@/lib/logger'

const rejectSchema = z.object({
    missionId: z.string()
})

// POST - Rejeter une mission (ne plus la proposer)
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = rejectSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'missionId requis' }, { status: 400 })
        }

        const { missionId } = parsed.data

        // Check if mission exists
        const mission = await db.mission.findUnique({
            where: { id: missionId }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 })
        }

        // Get agent profile
        const agent = await db.agent.findUnique({
            where: { userId: session.user.id }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Profil agent non trouvé' }, { status: 404 })
        }

        // Update the notification status to REJECTED (reuse existing model)
        await db.missionNotification.upsert({
            where: {
                missionId_agentId: {
                    missionId,
                    agentId: session.user.id
                }
            },
            create: {
                missionId,
                agentId: session.user.id,
                status: 'REJECTED'
            },
            update: {
                status: 'REJECTED'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Mission rejetée, elle ne sera plus proposée'
        })

    } catch (error) {
        logError(error, { context: 'agent-reject-mission' })
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// GET - Récupérer les IDs des missions rejetées par l'agent
export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const rejectedNotifications = await db.missionNotification.findMany({
            where: {
                agentId: session.user.id,
                status: 'REJECTED'
            },
            select: { missionId: true }
        })

        const rejectedIds = rejectedNotifications.map(n => n.missionId)

        return NextResponse.json({ rejectedIds })

    } catch (error) {
        logError(error, { context: 'get-rejected-missions' })
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
