'use server'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/agent/stats - Récupère les statistiques de l'agent connecté
export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const agent = await db.agent.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Profil agent non trouvé' }, { status: 404 })
        }

        // Calcul des stats du mois en cours
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Missions complétées ce mois
        const completedMissions = await db.mission.findMany({
            where: {
                agentId: agent.id,
                status: 'COMPLETED',
                updatedAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                title: true
            }
        })

        // Calcul des heures totales
        const totalHours = completedMissions.reduce((acc, mission) => {
            const start = new Date(mission.startTime)
            const end = new Date(mission.endTime)
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            return acc + hours
        }, 0)

        // Estimation des gains (25€/h)
        const HOURLY_RATE = 25
        const estimatedEarnings = Math.round(totalHours * HOURLY_RATE * 100) / 100

        // Missions en attente / actives
        const pendingMissions = await db.mission.count({
            where: {
                agentId: agent.id,
                status: { in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
            }
        })

        // Missions disponibles (pour l'agent)
        const availableMissions = await db.mission.count({
            where: {
                status: 'PENDING',
                agentId: null
            }
        })

        // Historique total
        const totalCompletedEver = await db.mission.count({
            where: {
                agentId: agent.id,
                status: 'COMPLETED'
            }
        })

        return NextResponse.json({
            user: {
                image: agent.user.image,
                name: agent.user.name,
            },
            month: {
                completedCount: completedMissions.length,
                totalHours: Math.round(totalHours * 10) / 10,
                estimatedEarnings,
            },
            current: {
                activeMissions: pendingMissions,
                availableMissions,
            },
            allTime: {
                totalCompleted: totalCompletedEver,
            }
        })

    } catch (error) {
        console.error('Stats API error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
