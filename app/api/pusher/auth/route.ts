import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body carefully
    let socketId: string | null = null
    let channel: string | null = null

    try {
        const formData = await req.formData()
        socketId = formData.get('socket_id') as string
        channel = formData.get('channel_name') as string
    } catch (e) {
        // Fallback to JSON if frontend sent JSON (unlikely for pusher-js but possible)
        try {
            const json = await req.json()
            socketId = json.socket_id
            channel = json.channel_name
        } catch (jsonError) {
            return NextResponse.json({ error: 'Invalid body format' }, { status: 400 })
        }
    }

    if (!socketId || !channel) {
        console.error('[Pusher Auth] Missing parameters')
        return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 })
    }

    // Support for private-user-{userId} channels (Agent notifications)
    if (channel.startsWith('private-user-')) {
        const expectedChannel = `private-user-${session.user.id}`

        if (channel !== expectedChannel) {
            return NextResponse.json({ error: 'Forbidden subscription' }, { status: 403 })
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channel, {
            user_id: session.user.id,
            user_info: { name: session.user.name, role: session.user.role },
        })
        return NextResponse.json(authResponse)
    }

    // Support for private-company-{userId} channels (Company notifications)
    if (channel.startsWith('private-company-')) {
        const expectedChannel = `private-company-${session.user.id}`
        if (channel !== expectedChannel) {
            return NextResponse.json({ error: 'Forbidden subscription' }, { status: 403 })
        }

        // Only COMPANY role can subscribe to company channels
        if (session.user.role !== 'COMPANY') {
            return NextResponse.json({ error: 'Only companies can subscribe to company channels' }, { status: 403 })
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channel, {
            user_id: session.user.id,
            user_info: { name: session.user.name, role: session.user.role },
        })
        return NextResponse.json(authResponse)
    }

    // Support for presence-mission-{missionId} channels (GPS tracking)
    if (channel.startsWith('presence-mission-')) {
        const missionId = channel.replace('presence-mission-', '')

        // Verify user has access to this mission
        if (session.user.role === 'COMPANY') {
            const company = await db.company.findUnique({ where: { userId: session.user.id } })
            if (!company) {
                return NextResponse.json({ error: 'Company not found' }, { status: 404 })
            }
            const mission = await db.mission.findFirst({
                where: { id: missionId, companyId: company.id }
            })
            if (!mission) {
                return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
            }
        } else if (session.user.role === 'AGENT') {
            const agent = await db.agent.findUnique({ where: { userId: session.user.id } })
            if (!agent) {
                return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
            }
            const mission = await db.mission.findFirst({
                where: { id: missionId, agentId: agent.id }
            })
            if (!mission) {
                return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channel, {
            user_id: session.user.id,
            user_info: { name: session.user.name, role: session.user.role },
        })
        return NextResponse.json(authResponse)
    }

    return NextResponse.json({ error: 'Unknown channel type' }, { status: 400 })
}

