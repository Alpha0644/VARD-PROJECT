
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Correct Next.js 15 params type
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const mission = await db.mission.findUnique({
            where: { id },
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        const { role } = session.user
        const body = await req.json().catch(() => ({}))
        const reason = body.reason || 'Annulation sans motif'

        // =======================================================
        // SCENARIO 1: COMPANY CANCELLATION (Definitive)
        // =======================================================
        if (role === 'COMPANY') {
            // Verify ownership
            const companyProfile = await db.company.findUnique({ where: { userId: session.user.id } })

            if (!companyProfile || mission.companyId !== companyProfile.id) {
                return NextResponse.json({ error: 'Ce n\'est pas votre mission' }, { status: 403 })
            }

            // Execute Cancellation
            const cancelledMission = await db.$transaction(async (tx) => {
                const m = await tx.mission.update({
                    where: { id },
                    data: {
                        status: 'CANCELLED',
                        agentId: null // Optional: keep trace or remove? Usually remove for clean slate, or keep for history. Let's keep agentId nullified if cancelled.
                    }
                })

                await tx.missionLog.create({
                    data: {
                        missionId: id,
                        userId: session.user.id,
                        previousStatus: mission.status,
                        newStatus: 'CANCELLED',
                        comment: `Mission annulée par l'entreprise : ${reason}`,
                    }
                })

                return m
            })

            // Notify involved parties
            await pusherServer.trigger(`company-${mission.companyId}`, 'mission:update', cancelledMission)
            if (mission.agentId) {
                await pusherServer.trigger(`agent-${mission.agentId}`, 'mission:cancelled', cancelledMission) // Specific event for strong alert
            }

            return NextResponse.json({ success: true, mission: cancelledMission })
        }

        // =======================================================
        // SCENARIO 2: AGENT CANCELLATION (Withdrawal/Unassign files)
        // =======================================================
        if (role === 'AGENT') {
            // ... existing agent logic ...
            const agentProfile = await db.agent.findUnique({ where: { userId: session.user.id } })

            if (!agentProfile || mission.agentId !== agentProfile.id) {
                return NextResponse.json({ error: 'Ce n\'est pas votre mission' }, { status: 403 })
            }

            const cancellableStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
            if (!cancellableStatuses.includes(mission.status)) {
                return NextResponse.json({ error: 'Statut invalide pour annulation' }, { status: 400 })
            }

            const updatedMission = await db.$transaction(async (tx) => {
                const m = await tx.mission.update({
                    where: { id },
                    data: {
                        status: 'PENDING',
                        agentId: null,
                    }
                })

                // Penalize Agent
                await tx.$executeRaw`UPDATE "Agent" SET "cancellationCount" = "cancellationCount" + 1 WHERE "userId" = ${session.user.id}`

                await tx.missionLog.create({
                    data: {
                        missionId: id,
                        userId: session.user.id,
                        previousStatus: mission.status,
                        newStatus: 'PENDING',
                        comment: 'Mission annulée par l\'agent (Remise en jeu)',
                    }
                })

                return m
            })

            // Notifications
            await pusherServer.trigger(`company-${mission.companyId}`, 'mission:update', updatedMission)
            await pusherServer.trigger('missions-channel', 'mission:available', updatedMission)

            return NextResponse.json({ success: true, mission: updatedMission })
        }

        return NextResponse.json({ error: 'Rôle non autorisé' }, { status: 403 })

    } catch (error) {
        console.error('Cancellation error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
