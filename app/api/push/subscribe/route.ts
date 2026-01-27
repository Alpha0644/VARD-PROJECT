import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for push subscription
const subscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string()
    })
})

// POST - Subscribe to push notifications
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = subscriptionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { endpoint, keys } = parsed.data

        // Upsert subscription (update if exists, create if not)
        await db.pushSubscription.upsert({
            where: { endpoint },
            create: {
                userId: session.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth
            },
            update: {
                userId: session.user.id,
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        })

        return NextResponse.json({ success: true, message: 'Abonnement enregistré' })

    } catch (error) {
        console.error('Push subscribe error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: Request) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const { endpoint } = body

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint requis' }, { status: 400 })
        }

        await db.pushSubscription.deleteMany({
            where: {
                userId: session.user.id,
                endpoint
            }
        })

        return NextResponse.json({ success: true, message: 'Désabonnement effectué' })

    } catch (error) {
        console.error('Push unsubscribe error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
