
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { sendPushNotification } from '@/lib/web-push'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const mission = await db.mission.findUnique({
            where: { id },
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        const { role } = session.user
        const body = await req.json().catch(() => ({}))
        const reason = body.reason || 'Annulation sans motif'

        // =======================================================
        // SCENARIO 1: COMPANY CANCELLATION (Definitive)
        // =======================================================
        if (role === 'COMPANY') {
            // Verify ownership
            const companyProfile = await db.company.findUnique({ where: { userId: session.user.id } })

            if (!companyProfile || mission.companyId !== companyProfile.id) {
                return NextResponse.json({ error: 'Ce n\'est pas votre mission' }, { status: 403 })
            }

            // Execute Cancellation
            const cancelledMission = await db.$transaction(async (tx) => {
                const m = await tx.mission.update({
                    where: { id },
                    data: {
                        status: 'CANCELLED',
                        agentId: null // Optional: keep trace or remove? Usually remove for clean slate, or keep for history. Let's keep agentId nullified if cancelled.
                    },
                    include: { company: true }
                })

                await tx.missionLog.create({
                    data: {
                        missionId: id,
                        userId: session.user.id,
                        previousStatus: mission.status,
                        newStatus: 'CANCELLED',
                        comment: `Mission annulée par l'entreprise : ${reason}`,
                    }
                })

                if (mission.agentId) {
                    // Fix: Resolve User ID from Agent ID because MissionLog refers to User
                    const agentProfile = await tx.agent.findUnique({
                        where: { id: mission.agentId },
                        select: { userId: true }
                    })

                    if (agentProfile) {
                        await tx.missionLog.create({
                            data: {
                                missionId: id,
                                userId: agentProfile.userId,
                                previousStatus: mission.status,
                                newStatus: 'CANCELLED',
                                comment: 'Mission annulée par l\'entreprise',
                            }
                        })
                    }
                }

                return m
            })

            // Notify involved parties
            await pusherServer.trigger(`company-${mission.companyId}`, 'mission:update', cancelledMission)

            if (mission.agentId) {
                // FIX: Resolve User ID from Agent Profile ID
                const agentProfile = await db.agent.findUnique({
                    where: { id: mission.agentId },
                    select: { userId: true }
                })

                if (agentProfile) {
                    const agentUserId = agentProfile.userId
                    console.log(`[Cancel] Agent Profile ID: ${mission.agentId}, User ID: ${agentUserId}`)

                    // Trigger Pusher on correct channel (private-user-{USER_ID})
                    await pusherServer.trigger(`private-user-${agentUserId}`, 'mission:cancelled', {
                        ...cancelledMission,
                        title: mission.title
                    })
                    console.log(`[Cancel] Pusher triggered on private-user-${agentUserId}`)

                    // Web Push (Background Notification)
                    const subscription = await db.pushSubscription.findFirst({
                        where: { userId: agentUserId }, // FIX: Use User ID, not Agent ID
                        orderBy: { createdAt: 'desc' }
                    })

                    if (subscription) {
                        console.log(`[Cancel] Subscription found for user ${agentUserId}`)
                        try {
                            const payload = {
                                title: '🚫 Mission Annulée',
                                body: `L'entreprise a annulé la mission "${mission.title}".`,
                                icon: '/icons/icon-192x192.png',
                                data: { url: '/agent/missions' }
                            }

                            const subFormatted = {
                                endpoint: subscription.endpoint,
                                keys: {
                                    p256dh: subscription.p256dh,
                                    auth: subscription.auth
                                }
                            }

                            const result = await sendPushNotification(subFormatted, payload)
                            console.log(`[Cancel] Push sent result: ${result}`)
                        } catch (e) {
                            console.error('[Cancel] Push failed', e)
                        }
                    } else {
                        console.warn(`[Cancel] No push subscription for user ${agentUserId}`)
                    }
                } else {
                    console.warn(`[Cancel] Agent profile not found for ID ${mission.agentId}`)
                }
            }

            return NextResponse.json({ success: true, mission: cancelledMission })
        }

        // =======================================================
        // SCENARIO 2: AGENT CANCELLATION (Withdrawal/Unassign files)
        // =======================================================
        if (role === 'AGENT') {
            // ... existing agent logic ...
            const agentProfile = await db.agent.findUnique({ where: { userId: session.user.id } })

            if (!agentProfile || mission.agentId !== agentProfile.id) {
                return NextResponse.json({ error: 'Ce n\'est pas votre mission' }, { status: 403 })
            }

            const cancellableStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED']
            if (!cancellableStatuses.includes(mission.status)) {
                return NextResponse.json({ error: 'Statut invalide pour annulation' }, { status: 400 })
            }

            const updatedMission = await db.$transaction(async (tx) => {
                const m = await tx.mission.update({
                    where: { id },
                    data: {
                        status: 'PENDING',
                        agentId: null,
                    }
                })

                // Penalize Agent
                await tx.$executeRaw`UPDATE "Agent" SET "cancellationCount" = "cancellationCount" + 1 WHERE "userId" = ${session.user.id}`

                await tx.missionLog.create({
                    data: {
                        missionId: id,
                        userId: session.user.id,
                        previousStatus: mission.status,
                        newStatus: 'PENDING',
                        comment: 'Mission annulée par l\'agent (Remise en jeu)',
                    }
                })

                return m
            })

            // Fetch company user ID for notification
            const missionCompany = await db.company.findUnique({
                where: { id: mission.companyId },
                select: { userId: true }
            })

            if (missionCompany) {
                await pusherServer.trigger(
                    `private-company-${missionCompany.userId}`,
                    'mission:status-change',
                    {
                        missionId: mission.id,
                        missionTitle: mission.title,
                        previousStatus: mission.status,
                        newStatus: 'CANCELLED', // Or 'PENDING' effectively for the mission, but logically it's a cancellation of the contract
                        agentName: session.user.name || 'Agent',
                        timestamp: new Date().toISOString(),
                        message: 'L\'agent a annulé la mission. Elle est de nouveau disponible.'
                    }
                )
            }

            // Notifications
            await pusherServer.trigger(`company-${mission.companyId}`, 'mission:update', updatedMission)
            await pusherServer.trigger('missions-channel', 'mission:available', updatedMission)

            return NextResponse.json({ success: true, mission: updatedMission })
        }

        return NextResponse.json({ error: 'Rôle non autorisé' }, { status: 403 })

    } catch (error) {
        console.error('Cancellation error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
