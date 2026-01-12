
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

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
            where: { userId: session.user.id }
        })

        if (!agent) return NextResponse.json({ error: 'Profil agent introuvable' }, { status: 404 })

        const mission = await db.mission.findUnique({
            where: { id: missionId }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        // Security: Ensure this agent is actually assigned to this mission
        if (mission.agentId !== agent.id) {
            return NextResponse.json({ error: 'Mission non attribuée à cet agent' }, { status: 403 })
        }

        // 2. Logic: Validate Transition (Optional but recommended)
        // e.g. Can't go from ACCEPTED directly to COMPLETED without IN_PROGRESS
        // Keeping it flexible for MVP, but logging it.

        // 3. Update
        const updatedMission = await db.mission.update({
            where: { id: missionId },
            data: {
                status,
                // Optionally update location if provided (last known location)
                latitude: latitude ?? mission.latitude,
                longitude: longitude ?? mission.longitude
            }
        })

        console.log(`[Mission ${missionId}] Status updated to ${status} by Agent ${agent.id}`)

        return NextResponse.json(updatedMission)

    } catch (error) {
        console.error('Update Status Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
