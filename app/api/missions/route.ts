import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkApiRateLimit } from '@/lib/rate-limit'
import { pusherServer } from '@/lib/pusher'
import { broadcastToAllAgents } from '@/lib/fcm'
import { createMissionSchema } from '@/lib/validations/mission'
import { logger, logMission, logError } from '@/lib/logger'
import {
    handleApiError,
    UnauthorizedError,
    ForbiddenError,
    RateLimitError,
    BadRequestError
} from '@/lib/api-error'

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'COMPANY') {
            throw new UnauthorizedError('Non autorisé')
        }

        if (!session.user.isVerified) {
            throw new ForbiddenError('Compte non vérifié')
        }

        // Rate limiting (20 req/min)
        const rateLimit = await checkApiRateLimit('mission', session.user.id)

        if (!rateLimit.success) {
            throw new RateLimitError('Limite: 20 créations de missions par minute')
        }

        const body = await req.json()

        const validated = createMissionSchema.safeParse(body)

        if (!validated.success) {
            // ZodError handled by handleApiError, but here we have a SafeParseReturnType.
            // We can either throw the error or return manual response.
            // To be consistent, let's keep manual response for now or throw custom BadRequest
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
            company = await db.company.create({
                data: {
                    userId: session.user.id,
                    companyName: session.user.name || 'Agence Sans Nom',
                    siren: 'PENDING-' + Math.floor(Math.random() * 100000),
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

        logMission('created', mission.id, { companyId: company.id, location })

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
        } catch (e) {
            logError(e, { context: 'pusher-broadcast', missionId: mission.id })
        }

        // Send Push Notifications to all subscribed agents (Web + FCM)
        try {
            const pushPayload = {
                title: 'Nouvelle mission disponible',
                body: `${mission.title} · ${mission.location}`,
                tag: `mission-${mission.id}`,
                data: {
                    url: `/agent/missions/${mission.id}`,
                    missionId: mission.id
                }
            }

            const result = await broadcastToAllAgents(pushPayload)
            logger.info({ missionId: mission.id, ...result }, 'Push notifications sent (Web + FCM)')
        } catch (pushError) {
            logError(pushError, { context: 'push-notifications', missionId: mission.id })
        }

        // 3. Notify ALL Agents (MVP: No proximity filter)
        const allAgents = await db.agent.findMany({
            select: { userId: true }
        })

        const channelsSent: string[] = []

        for (const agent of allAgents) {
            const channel = `private-user-${agent.userId}`

            try {
                await pusherServer.trigger(
                    channel,
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
                channelsSent.push(channel)

            } catch (e) {
                logError(e, { context: 'pusher-agent-notify', channel, missionId: mission.id })
            }
        }

        logger.info({ missionId: mission.id, agentsNotified: allAgents.length }, 'Mission created and agents notified')

        return NextResponse.json({
            mission,
            notifiedCount: allAgents.length,
        })
    } catch (error) {
        return handleApiError(error)
    }
}
