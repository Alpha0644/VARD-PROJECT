import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/company/stats - Récupère les statistiques de l'entreprise
export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'COMPANY') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const company = await db.company.findUnique({
            where: { userId: session.user.id }
        })

        if (!company) {
            return NextResponse.json({ error: 'Profil entreprise non trouvé' }, { status: 404 })
        }

        // Get current date ranges
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        // Missions this month
        const missionsThisMonth = await db.mission.count({
            where: {
                companyId: company.id,
                createdAt: { gte: startOfMonth }
            }
        })

        // Missions this week
        const missionsThisWeek = await db.mission.count({
            where: {
                companyId: company.id,
                createdAt: { gte: startOfWeek }
            }
        })

        // Completed missions this month
        const completedThisMonth = await db.mission.count({
            where: {
                companyId: company.id,
                status: 'COMPLETED',
                updatedAt: { gte: startOfMonth }
            }
        })

        // Active missions (in progress)
        const activeMissions = await db.mission.count({
            where: {
                companyId: company.id,
                status: { in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
            }
        })

        // Pending missions (waiting for agent)
        const pendingMissions = await db.mission.count({
            where: {
                companyId: company.id,
                status: 'PENDING'
            }
        })

        // Total missions all time
        const totalMissions = await db.mission.count({
            where: { companyId: company.id }
        })

        // Total completed all time
        const totalCompleted = await db.mission.count({
            where: { companyId: company.id, status: 'COMPLETED' }
        })

        // Calculate hours and costs (estimated)
        const completedMissionsData = await db.mission.findMany({
            where: {
                companyId: company.id,
                status: 'COMPLETED',
                updatedAt: { gte: startOfMonth }
            },
            select: {
                startTime: true,
                endTime: true
            }
        })

        const HOURLY_RATE = 25
        let totalHoursThisMonth = 0

        for (const m of completedMissionsData) {
            const hours = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
            totalHoursThisMonth += hours
        }

        const estimatedCostThisMonth = Math.round(totalHoursThisMonth * HOURLY_RATE * 100) / 100

        // Completion rate
        const completionRate = totalMissions > 0
            ? Math.round((totalCompleted / totalMissions) * 100)
            : 0

        return NextResponse.json({
            month: {
                missions: missionsThisMonth,
                completed: completedThisMonth,
                hours: Math.round(totalHoursThisMonth * 10) / 10,
                cost: estimatedCostThisMonth
            },
            week: {
                missions: missionsThisWeek
            },
            current: {
                active: activeMissions,
                pending: pendingMissions
            },
            allTime: {
                total: totalMissions,
                completed: totalCompleted,
                completionRate
            }
        })

    } catch (error) {
        console.error('Company stats error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
