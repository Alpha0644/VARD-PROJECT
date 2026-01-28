import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { findNearbyAgents } from '@/lib/redis-geo'
import { checkApiRateLimit } from '@/lib/rate-limit'
import { sendMissionNotificationEmail } from '@/lib/email'
import { pusherServer } from '@/lib/pusher'
import { sendPushToAll, PushSubscriptionData } from '@/lib/web-push'

import { createMissionSchema } from '@/lib/validations/mission'

export async function POST(req: Request) {
    try {
        const session = await auth()


        if (!session || session.user.role !== 'COMPANY') {

            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        if (!session.user.isVerified) {
            return NextResponse.json({ error: 'Compte non vérifié' }, { status: 403 })
        }

        // Rate limiting (20 req/min)
        const rateLimit = await checkApiRateLimit('mission', session.user.id)

        if (!rateLimit.success) {
            return NextResponse.json(
                {
                    error: 'Trop de requêtes',
                    message: 'Limite: 20 créations de missions par minute'
                },
                { status: 429 }
            )
        }

        const body = await req.json()

        const validated = createMissionSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validated.error.flatten() },
                { status: 400 }
            )
        }

        const { title, description, startTime, endTime, location, latitude, longitude } = validated.data

        // 1. Ensure Company Profile exists
        let company = await db.company.findUnique({
            where: { userId: session.user.id },
        })

        if (!company) {
            // Lazy create company profile if missing (MVP shortcut)
            company = await db.company.create({
                data: {
                    userId: session.user.id,
                    companyName: session.user.name || 'Agence Sans Nom',
                    siren: 'PENDING-' + Math.floor(Math.random() * 100000), // Temporary placeholder
                },
            })
        }

        // 2. Create Mission in DB
        const mission = await db.mission.create({
            data: {
                title,
                description,
                startTime,
                endTime,
                location,
                latitude,
                longitude,
                status: 'PENDING',
                companyId: company.id,
            },
        })

        // Broadcast to Public Job Board (Live Feed)
        await pusherServer.trigger('public-missions', 'mission:created', {
            id: mission.id,
            title: mission.title,
            description: mission.description,
            location: mission.location,
            startTime: mission.startTime.toISOString(),
            endTime: mission.endTime.toISOString(),
            company: {
                companyName: company.companyName,
            },
        })

        // Send Push Notifications to all subscribed agents
        try {
            const subscriptions = await db.pushSubscription.findMany({
                select: {
                    endpoint: true,
                    p256dh: true,
                    auth: true
                }
            })

            if (subscriptions.length > 0) {
                const pushSubs: PushSubscriptionData[] = subscriptions.map(s => ({
                    endpoint: s.endpoint,
                    keys: {
                        p256dh: s.p256dh,
                        auth: s.auth
                    }
                }))

                await sendPushToAll(pushSubs, {
                    title: '🚨 Nouvelle mission',
                    body: `${title} - ${location}`,
                    icon: '/icon-192.png',
                    tag: `mission-${mission.id}`,
                    data: {
                        url: '/agent/dashboard',
                        missionId: mission.id
                    }
                })
            }
        } catch (pushError) {
            console.error('[Push Notifications] Error:', pushError)
            // Don't fail the request if push fails
        }

        // 3. Find Nearby Agents (Matching Engine)
        // Radius: 10km default
        const nearbyUserIds = await findNearbyAgents(latitude, longitude, 10)

        // 4. Create Notifications and Send Emails
        if (nearbyUserIds.length > 0) {
            // Get agent emails for email notifications
            const agentUsers = await db.user.findMany({
                where: { id: { in: nearbyUserIds } },
                select: { id: true, email: true }
            })

            for (const targetUserId of nearbyUserIds) {
                try {
                    // Create in-app notification
                    await db.missionNotification.create({
                        data: {
                            missionId: mission.id,
                            agentId: targetUserId,
                            status: 'SENT',
                        }
                    })

                    // Send email notification
                    const agentUser = agentUsers.find(u => u.id === targetUserId)
                    if (agentUser?.email) {
                        await sendMissionNotificationEmail(
                            agentUser.email,
                            title,
                            location,
                            startTime,
                            company.companyName
                        )
                    }

                    // Trigger Pusher Real-time Event
                    await pusherServer.trigger(
                        `private-user-${targetUserId}`,
                        'mission:new',
                        {
                            id: mission.id,
                            title: mission.title,
                            location: mission.location,
                            companyName: company.companyName,
                            startTime: startTime.toISOString(),
                            link: `/agent/missions/${mission.id}`
                        }
                    )

                } catch (e) {
                    // Skip if already exists (unique constraint)
                    console.error(`[Mission Matching] Failed to notify user ${targetUserId}:`, e)
                }
            }

            return NextResponse.json({ mission, notifiedCount: nearbyUserIds.length })
        }

        return NextResponse.json({ mission, notifiedCount: 0 })
    } catch (error) {
        console.error('Create Mission Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
