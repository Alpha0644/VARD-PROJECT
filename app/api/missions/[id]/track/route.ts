import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { trackingSchema } from '@/lib/validations/tracking'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const payload = trackingSchema.parse(body)

        // 1. Verify Mission Ownership
        const mission = await db.mission.findUnique({
            where: { id: params.id },
            select: {
                agent: { select: { userId: true } },
                status: true
            }
        })

        if (!mission) return new NextResponse('Mission not found', { status: 404 })

        if (mission.agent?.userId !== session.user.id) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // 2. Only allow tracking for active missions
        if (!['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(mission.status)) {
            return new NextResponse('Mission not active', { status: 400 })
        }

        // 3. Trigger Pusher Event
        await pusherServer.trigger(
            `private-mission-${params.id}`,
            'server-location-update',
            payload
        )

        // 4. Update mission last known location (optional, for persistence)
        // Note: Adding lat/lng columns to Mission table would be better for initial load
        // checking if schema supports it, if not skipping for now to keep it simpler
        // const isSupported = ...

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid payload', { status: 400 })
        }
        console.error('Tracking Error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
