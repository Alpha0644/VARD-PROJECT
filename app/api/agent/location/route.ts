import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { updateAgentLocation } from '@/lib/redis-geo'
import { logger, logError } from '@/lib/logger'

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

        let body
        try {
            body = await req.json()
        } catch (e) {
            logError(e, { context: 'location-parse-body', userId: session.user.id })
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }
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
        logError(error, { context: 'update-location', userId: session.user.id })
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// GET: Retrieve agent's current location
export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Try Redis first (faster)
        const { getAgentLocation } = await import('@/lib/redis-geo')
        const redisLocation = await getAgentLocation(session.user.id)

        if (redisLocation) {
            return NextResponse.json({
                latitude: redisLocation.lat,
                longitude: redisLocation.long,
                source: 'redis'
            })
        }

        // Fallback to DB
        const agent = await db.agent.findUnique({
            where: { userId: session.user.id },
            select: { latitude: true, longitude: true }
        })

        if (agent?.latitude && agent?.longitude) {
            return NextResponse.json({
                latitude: agent.latitude,
                longitude: agent.longitude,
                source: 'database'
            })
        }

        return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    } catch (error) {
        logError(error, { context: 'get-location' })
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
