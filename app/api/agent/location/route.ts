import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { updateAgentLocation } from '@/lib/redis-geo'

const locationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await req.json()
        const validated = locationSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 })
        }

        const { latitude, longitude } = validated.data

        // 1. Update Redis (Fast & for Matching)
        await updateAgentLocation(session.user.id, latitude, longitude)

        // 2. Update DB (Persistence & Profile)
        // Lazy create agent profile if missing
        let agent = await db.agent.findUnique({
            where: { userId: session.user.id }
        })

        if (!agent) {
            agent = await db.agent.create({
                data: {
                    userId: session.user.id,
                    cartePro: 'PENDING-' + Math.floor(Math.random() * 100000), // Placeholder
                    carteProExp: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    latitude,
                    longitude,
                }
            })
        } else {
            await db.agent.update({
                where: { id: agent.id },
                data: { latitude, longitude }
            })
        }

        return NextResponse.json({ success: true, lat: latitude, long: longitude })
    } catch (error) {
        console.error('Update Location Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
