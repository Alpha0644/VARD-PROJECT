import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { pusherServer } from '@/lib/pusher'
import { findNearbyAgents } from '@/lib/redis-geo'
import { sendMissionNotificationEmail } from '@/lib/email'
import { sendPushToAll, PushSubscriptionData } from '@/lib/web-push'

const cancelSchema = z.object({
    reason: z.string().optional(),
    cancelledBy: z.enum(['COMPANY', 'AGENT']),
})

// Statuses that can be cancelled
const CANCELLABLE_STATUSES = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED']

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const missionId = params.id
        const body = await req.json()

        const validated = cancelSchema.safeParse(body)
        if (!validated.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { reason, cancelledBy } = validated.data

        // 1. Fetch mission with relations
        const mission = await db.mission.findUnique({
            where: { id: missionId },
            include: {
                company: { include: { user: true } },
                agent: { include: { user: true } }
            }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        // 2. Check authorization
        if (cancelledBy === 'COMPANY') {
            // Only the company owner can cancel
            if (session.user.role !== 'COMPANY' || mission.company.userId !== session.user.id) {
                return NextResponse.json({ error: 'Non autorisé à annuler cette mission' }, { status: 403 })
            }
        } else if (cancelledBy === 'AGENT') {
            // Only the assigned agent can cancel
            if (session.user.role !== 'AGENT') {
                return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
            }
            const agent = await db.agent.findUnique({
                where: { userId: session.user.id }
            })
            if (!agent || mission.agentId !== agent.id) {
                return NextResponse.json({ error: 'Non autorisé à annuler cette mission' }, { status: 403 })
            }
        }

        // 3. Check if mission can be cancelled
        if (!CANCELLABLE_STATUSES.includes(mission.status)) {
            return NextResponse.json({
                error: 'Cette mission ne peut pas être annulée',
                message: `Une mission avec le statut "${mission.status}" ne peut pas être annulée.`
            }, { status: 400 })
        }

        // 4. Store previous agent for penalty if agent cancels
        const previousAgentId = mission.agentId
        const wasAgentAssigned = previousAgentId !== null

        // 5. Update mission status
        const updatedMission = await db.mission.update({
            where: { id: missionId },
            data: {
                status: 'CANCELLED',
                agentId: null, // Unassign agent
            }
        })

        // 6. Create cancellation log
        await db.missionLog.create({
            data: {
                missionId,
                userId: session.user.id,
                previousStatus: mission.status,
                newStatus: 'CANCELLED',
                comment: `Mission cancelled by ${cancelledBy}${reason ? `: ${reason}` : ''}`
            }
        })

        // 7. If AGENT cancelled a mission they accepted → increment cancellation count
        if (cancelledBy === 'AGENT' && wasAgentAssigned && previousAgentId) {
            await db.agent.update({
                where: { id: previousAgentId },
                data: {
                    cancellationCount: { increment: 1 }
                }
            })
        }

        // 8. Notify affected parties via Pusher
        try {
            if (cancelledBy === 'COMPANY' && mission.agent) {
                // Notify agent that their mission was cancelled
                await pusherServer.trigger(
                    `private-user-${mission.agent.userId}`,
                    'mission:cancelled',
                    {
                        missionId: mission.id,
                        missionTitle: mission.title,
                        cancelledBy: 'COMPANY',
                        message: 'La mission a été annulée par l\'agence.'
                    }
                )
            } else if (cancelledBy === 'AGENT') {
                // Notify company that agent cancelled
                await pusherServer.trigger(
                    `private-company-${mission.company.userId}`,
                    'mission:cancelled',
                    {
                        missionId: mission.id,
                        missionTitle: mission.title,
                        cancelledBy: 'AGENT',
                        agentName: mission.agent?.user.name || 'Agent',
                        message: 'L\'agent a annulé la mission.'
                    }
                )
            }
        } catch (pusherError) {
            console.error('[Cancel] Pusher notification failed:', pusherError)
        }

        // 9. If agent cancelled and mission was active → RELAUNCH MATCHING
        let relaunched = false
        let notifiedAgentsCount = 0

        if (cancelledBy === 'AGENT' && wasAgentAssigned) {
            // Reset mission to PENDING for re-matching
            await db.mission.update({
                where: { id: missionId },
                data: {
                    status: 'PENDING',
                    agentId: null
                }
            })

            // Find nearby agents (excluding the one who cancelled)
            const nearbyUserIds = await findNearbyAgents(mission.latitude, mission.longitude, 10)
            const eligibleUserIds = nearbyUserIds.filter(id => id !== mission.agent?.userId)

            if (eligibleUserIds.length > 0) {
                // Get agent emails
                const agentUsers = await db.user.findMany({
                    where: { id: { in: eligibleUserIds } },
                    select: { id: true, email: true }
                })

                for (const targetUserId of eligibleUserIds) {
                    try {
                        // Check if notification already exists
                        const existing = await db.missionNotification.findUnique({
                            where: {
                                missionId_agentId: {
                                    missionId: mission.id,
                                    agentId: targetUserId
                                }
                            }
                        })

                        if (!existing) {
                            await db.missionNotification.create({
                                data: {
                                    missionId: mission.id,
                                    agentId: targetUserId,
                                    status: 'SENT',
                                }
                            })
                        }

                        // Send email
                        const agentUser = agentUsers.find(u => u.id === targetUserId)
                        if (agentUser?.email) {
                            await sendMissionNotificationEmail(
                                agentUser.email,
                                mission.title,
                                mission.location,
                                mission.startTime,
                                mission.company.companyName
                            )
                        }

                        // Send Pusher notification
                        await pusherServer.trigger(
                            `private-user-${targetUserId}`,
                            'mission:new',
                            {
                                id: mission.id,
                                title: mission.title,
                                location: mission.location,
                                companyName: mission.company.companyName,
                                startTime: mission.startTime.toISOString(),
                                link: `/agent/missions/${mission.id}`,
                                message: '🔄 Mission disponible à nouveau !'
                            }
                        )

                        notifiedAgentsCount++
                    } catch (e) {
                        console.error(`[Relaunch] Failed to notify user ${targetUserId}:`, e)
                    }
                }

                // Send push notifications
                try {
                    const subscriptions = await db.pushSubscription.findMany({
                        where: { userId: { in: eligibleUserIds } },
                        select: { endpoint: true, p256dh: true, auth: true }
                    })

                    if (subscriptions.length > 0) {
                        const pushSubs: PushSubscriptionData[] = subscriptions.map(s => ({
                            endpoint: s.endpoint,
                            keys: { p256dh: s.p256dh, auth: s.auth }
                        }))

                        await sendPushToAll(pushSubs, {
                            title: '🔄 Mission disponible',
                            body: `${mission.title} - ${mission.location}`,
                            icon: '/icon-192.png',
                            tag: `mission-relaunch-${mission.id}`,
                            data: { url: '/agent/dashboard', missionId: mission.id }
                        })
                    }
                } catch (pushError) {
                    console.error('[Relaunch] Push notifications failed:', pushError)
                }

                relaunched = true
            }

            // Update log to indicate relaunch
            await db.missionLog.create({
                data: {
                    missionId,
                    userId: session.user.id,
                    previousStatus: 'CANCELLED',
                    newStatus: 'PENDING',
                    comment: `Mission relaunched after agent cancellation. Notified ${notifiedAgentsCount} agents.`
                }
            })
        }

        return NextResponse.json({
            success: true,
            mission: updatedMission,
            relaunched,
            notifiedAgentsCount,
            message: cancelledBy === 'AGENT' && relaunched
                ? `Mission annulée. ${notifiedAgentsCount} agents ont été notifiés.`
                : 'Mission annulée avec succès.'
        })

    } catch (error) {
        console.error('Cancel Mission Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
