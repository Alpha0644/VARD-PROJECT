import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { updateAgentLiveLocation } from '@/lib/redis-geo'
import { pusherServer } from '@/lib/pusher'
import { checkApiRateLimit } from '@/lib/rate-limit'

const locationSchema = z.object({
    missionId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
})

export async function POST(req: Request) {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 12 per minute = 1 per 5s
    const rateLimitResult = await checkApiRateLimit('location', session.user.id)
    if (!rateLimitResult.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = locationSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const { missionId, latitude, longitude } = parsed.data

    // Verify agent owns this mission
    const agent = await db.agent.findUnique({ where: { userId: session.user.id } })
    if (!agent) {
        return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 })
    }

    const mission = await db.mission.findFirst({
        where: {
            id: missionId,
            agentId: agent.id,
            status: { in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
        }
    })

    if (!mission) {
        return NextResponse.json({ error: 'Mission not found or not active' }, { status: 404 })
    }

    // Store location in Redis
    await updateAgentLiveLocation(agent.id, missionId, latitude, longitude)

    // Trigger Pusher event for real-time update
    await pusherServer.trigger(
        `presence-mission-${missionId}`,
        'agent:location',
        {
            agentId: agent.id,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        }
    )

    return NextResponse.json({ success: true })
}
