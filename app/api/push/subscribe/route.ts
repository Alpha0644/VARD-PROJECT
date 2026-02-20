import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Validation Schemas ───────────────────────────────────────────

/** Web Push subscription (VAPID / Service Worker) */
const webSubscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1)
    })
})

/** Native Mobile subscription (FCM token) */
const mobileSubscriptionSchema = z.object({
    fcmToken: z.string().min(10, 'FCM token too short'),
    platform: z.enum(['android', 'ios'])
})

/** Union: accept either Web or Mobile format */
const subscriptionSchema = z.union([webSubscriptionSchema, mobileSubscriptionSchema])

// ─── POST: Subscribe to push notifications ────────────────────────

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = subscriptionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const data = parsed.data

        // Determine if this is a Web or Mobile subscription
        if ('fcmToken' in data) {
            // ─── Mobile (FCM) ─────────────────────────────────
            const endpoint = `fcm://${data.platform}/${data.fcmToken.slice(0, 20)}`

            await db.pushSubscription.upsert({
                where: { endpoint },
                create: {
                    userId: session.user.id,
                    endpoint,
                    fcmToken: data.fcmToken,
                    platform: data.platform,
                },
                update: {
                    userId: session.user.id,
                    fcmToken: data.fcmToken,
                }
            })
        } else {
            // ─── Web (VAPID) ──────────────────────────────────
            await db.pushSubscription.upsert({
                where: { endpoint: data.endpoint },
                create: {
                    userId: session.user.id,
                    endpoint: data.endpoint,
                    p256dh: data.keys.p256dh,
                    auth: data.keys.auth,
                    platform: 'web',
                },
                update: {
                    userId: session.user.id,
                    p256dh: data.keys.p256dh,
                    auth: data.keys.auth,
                }
            })
        }

        return NextResponse.json({ success: true, message: 'Abonnement enregistré' })

    } catch (error) {
        console.error('Push subscribe error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ─── DELETE: Unsubscribe from push notifications ──────────────────

export async function DELETE(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()

        const deleteSchema = z.object({
            endpoint: z.string().optional(),
            fcmToken: z.string().optional(),
        }).refine(data => data.endpoint || data.fcmToken, {
            message: 'endpoint ou fcmToken requis'
        })

        const parsed = deleteSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { endpoint, fcmToken } = parsed.data

        if (endpoint) {
            await db.pushSubscription.deleteMany({
                where: { userId: session.user.id, endpoint }
            })
        } else if (fcmToken) {
            await db.pushSubscription.deleteMany({
                where: { userId: session.user.id, fcmToken }
            })
        }

        return NextResponse.json({ success: true, message: 'Désabonnement effectué' })

    } catch (error) {
        console.error('Push unsubscribe error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
