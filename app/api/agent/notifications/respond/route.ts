import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const responseSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'])
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Next.js 15: params is async now if checking specific route types but standard API route params are usually accessible if defined in folder structure.
        // Wait, I am inside `app/api/agent/notifications/[id]/respond/route.ts`?
        // Ah, I need to define the file path carefully.
        // Let's assume this file is at `app/api/agent/notifications/respond/route.ts` and uses body for ID or 
        // `app/api/agent/notifications/[id]/respond/route.ts`.
        // Let's go with the cleaner body approach or standardized dynamic route.
        // I will use `app/api/agent/notifications/respond/route.ts` and pass ID in body to keep it simple and avoid folder nesting hell for a single action.

        const body = await req.json()
        const { notificationId, status } = z.object({
            notificationId: z.string(),
            status: z.enum(['ACCEPTED', 'REJECTED'])
        }).parse(body)

        // Verify ownership
        const notification = await db.missionNotification.findUnique({
            where: { id: notificationId }
        })

        if (!notification || notification.agentId !== session.user.id) {
            return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
        }

        // Update Notification
        await db.missionNotification.update({
            where: { id: notificationId },
            data: { status }
        })

        // If Accepted, assign Agent to Mission?
        // For MVP 1.3, let's just mark it accepted. Phase 1.4 can handle the "Contract".
        if (status === 'ACCEPTED') {
            // Assign Agent to Mission
            const agent = await db.agent.findUnique({ where: { userId: session.user.id } })
            if (agent) {
                await db.mission.update({
                    where: { id: notification.missionId },
                    data: {
                        agentId: agent.id,
                        status: 'ACCEPTED'
                    }
                })
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Respond Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
