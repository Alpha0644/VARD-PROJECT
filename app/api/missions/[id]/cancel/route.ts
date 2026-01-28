
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

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const mission = await db.mission.findUnique({
            where: { id },
            include: { agent: true }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        // Verify ownership
        // Ideally we find the Agent profile first
        const agentProfile = await db.agent.findUnique({ where: { userId: session.user.id } })

        if (!agentProfile || mission.agentId !== agentProfile.id) {
            return NextResponse.json({ error: 'Ce n\'est pas votre mission' }, { status: 403 })
        }

        // Verify Status
        const cancellableStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
        if (!cancellableStatuses.includes(mission.status)) {
            return NextResponse.json({
                error: 'Impossible d\'annuler une mission en cours ou terminée'
            }, { status: 400 })
        }

        // TRANSACTION: Reset Mission & Penalize Agent
        const updatedMission = await db.$transaction(async (tx) => {
            // 1. Update Mission
            const m = await tx.mission.update({
                where: { id },
                data: {
                    status: 'PENDING', // Return to pool
                    agentId: null,      // Remove assignment
                }
            })

            // 2. Penalize Agent (Use raw query to bypass potential client type mismatch if outdated)
            // Assuming table name is "Agent" and columns are "userId", "cancellationCount"
            await tx.$executeRaw`UPDATE "Agent" SET "cancellationCount" = "cancellationCount" + 1 WHERE "userId" = ${session.user.id}`

            // 3. Log
            await tx.missionLog.create({
                data: {
                    missionId: id,
                    userId: session.user.id,
                    previousStatus: mission.status,
                    newStatus: 'PENDING', // Log as reset to pending
                    comment: 'Mission annulée par l\'agent (Remise en jeu)',
                }
            })

            return m
        })

        // NOTIFICATIONS (Pusher)

        // 1. Notify Company (Update specific mission card)
        await pusherServer.trigger(
            `company-${mission.companyId}`,
            'mission:update',
            updatedMission
        )

        // 2. Notify ALL Agents (New mission available!)
        // We trigger 'mission:available' so it pops up on the map for everyone
        await pusherServer.trigger(
            'missions-channel',
            'mission:available',
            updatedMission
        )

        // 3. Notify the cancelling agent specifically to force UI refresh (remove active mission)
        // By sending an update where agentId is null, the frontend check (if mission.agentId === currentAgentId) should fail
        await pusherServer.trigger(
            `agent-${session.user.id}`,
            'mission:update',
            updatedMission
        )

        return NextResponse.json({ success: true, mission: updatedMission })

    } catch (error) {
        console.error('Cancellation error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
