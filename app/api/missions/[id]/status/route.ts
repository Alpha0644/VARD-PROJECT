
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { pusherServer } from '@/lib/pusher'

// Valid status transitions
const ALLOWED_STATUSES = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

const statusUpdateSchema = z.object({
    status: z.enum(ALLOWED_STATUSES),
    latitude: z.number().optional(), // For tracking where update happened
    longitude: z.number().optional()
})

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const missionId = params.id
        const body = await req.json()

        const validated = statusUpdateSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { status, latitude, longitude } = validated.data

        // 1. Verify Verification & Ownership
        const agent = await db.agent.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
        })

        if (!agent) return NextResponse.json({ error: 'Profil agent introuvable' }, { status: 404 })

        const mission = await db.mission.findUnique({
            where: { id: missionId },
            include: {
                company: { include: { user: true } }
            }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        // Special handling for ACCEPTING a mission (Assignment)
        if (status === 'ACCEPTED') {
            if (mission.status !== 'PENDING') {
                return NextResponse.json({ error: 'Mission déjà acceptée par quelqu\'un d\'autre' }, { status: 409 })
            }
            // Assign user
            // We proceed to update
        } else {
            // Standard status update (EN_ROUTE, etc.) -> Must be assigned agent
            if (mission.agentId !== agent.id) {
                return NextResponse.json({ error: 'Mission non attribuée à cet agent' }, { status: 403 })
            }
        }

        const previousStatus = mission.status

        // 2. Update Mission Status
        const updatedMission = await db.mission.update({
            where: { id: missionId },
            data: {
                status,
                agentId: status === 'ACCEPTED' ? agent.id : undefined, // Assign agent if accepting
                latitude: latitude ?? mission.latitude,
                longitude: longitude ?? mission.longitude
            }
        })

        // 3. Create Mission Log
        await db.missionLog.create({
            data: {
                missionId,
                userId: session.user.id,
                previousStatus,
                newStatus: status,
                latitude,
                longitude,
                comment: `Status changed from ${previousStatus} to ${status}`
            }
        })

        // 4. Send Real-time Notification to Company
        try {
            await pusherServer.trigger(
                `private-company-${mission.company.userId}`,
                'mission:status-change',
                {
                    missionId: mission.id,
                    missionTitle: mission.title,
                    previousStatus,
                    newStatus: status,
                    agentName: agent.user.name || 'Agent',
                    location: mission.location,
                    timestamp: new Date().toISOString()
                }
            )
        } catch (pusherError) {
            console.error('Pusher notification failed:', pusherError)
            // Don't fail the request if Pusher fails
        }

        return NextResponse.json(updatedMission)

    } catch (error) {
        console.error('Update Status Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

