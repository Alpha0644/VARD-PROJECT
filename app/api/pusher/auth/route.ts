import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.formData()
    const socketId = data.get('socket_id') as string
    const channel = data.get('channel_name') as string

    // Security: Only allow subscribing to own user channel
    // Convention: private-user-{userId}
    const expectedChannel = `private-user-${session.user.id}`

    if (channel !== expectedChannel) {
        return NextResponse.json({ error: 'Forbidden subscription' }, { status: 403 })
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            role: session.user.role,
        },
    })

    return NextResponse.json(authResponse)
}
