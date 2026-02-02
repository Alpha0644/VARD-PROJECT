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
        try {
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
            console.log('DEBUG: Pusher triggered')
        } catch (e) {
            console.error('DEBUG: Pusher failed', e)
        }

        // Send Push Notifications to all subscribed agents
        try {
            console.log('DEBUG: Fetching subs')
            const subscriptions = await db.pushSubscription.findMany({
                select: {
                    endpoint: true,
                    p256dh: true,
                    auth: true
                }
            })
            console.log('DEBUG: Subs found', subscriptions.length)

            if (subscriptions.length > 0) {
                // Map DB shape to Library shape
                const formattedSubs: PushSubscriptionData[] = subscriptions.map(sub => ({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }))

                const pushPayload = {
                    title: `Nouvelle mission: ${mission.title}`,
                    body: `À ${mission.location} - ${company.companyName}`,
                    icon: '/icon-192.png',
                    data: {
                        url: `/agent/missions/${mission.id}`,
                        missionId: mission.id
                    }
                }

                await sendPushToAll(formattedSubs, pushPayload)
            }
        } catch (pushError) {
            console.error('[Push Notifications] Error:', pushError)
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
                            missionId: mission.id,  // FIXED: Was 'id', frontend expects 'missionId'
                            title: mission.title,
                            location: mission.location,
                            companyName: company.companyName,
                            startTime: startTime.toISOString(),
                            link: `/agent/dashboard`
                        }
                    )

                } catch (e) {
                    // Skip if already exists (unique constraint)
                    console.error(`[Mission Matching] Failed to notify user ${targetUserId}:`, e)
                }
            }

            return NextResponse.json({ mission, notifiedCount: nearbyUserIds.length })
        } else {
            // FALLBACK: No nearby agents found in Redis (location not synced)
            // Notify ALL agents with push subscriptions as a fallback
            console.log('[Mission] No nearby agents in Redis, broadcasting to all agents')

            try {
                // Get all agent user IDs
                const allAgents = await db.agent.findMany({
                    select: { userId: true }
                })

                for (const agent of allAgents) {
                    try {
                        await pusherServer.trigger(
                            `private-user-${agent.userId}`,
                            'mission:new',
                            {
                                missionId: mission.id,
                                title: mission.title,
                                location: mission.location,
                                companyName: company.companyName,
                                startTime: startTime.toISOString(),
                                link: `/agent/dashboard`
                            }
                        )
                        console.log(`[Mission] Broadcasted to agent ${agent.userId}`)
                    } catch (e) {
                        console.error(`[Mission] Failed to notify agent ${agent.userId}:`, e)
                    }
                }

                return NextResponse.json({ mission, notifiedCount: allAgents.length, fallback: true })
            } catch (e) {
                console.error('[Mission] Fallback broadcast failed:', e)
                return NextResponse.json({ mission, notifiedCount: 0 })
            }
        }
    } catch (error) {
        console.error('Create Mission Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
