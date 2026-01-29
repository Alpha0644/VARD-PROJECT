import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, parseISO, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'COMPANY') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Fetch Company ID
        const company = await db.company.findUnique({
            where: { userId: session.user.id }
        })

        if (!company) return new NextResponse('Company not found', { status: 404 })

        const { searchParams } = new URL(req.url)
        const dateParam = searchParams.get('date') // YYYY-MM

        let targetDate = new Date()
        if (dateParam) {
            targetDate = parseISO(`${dateParam}-01`)
        }

        const startDate = startOfMonth(targetDate)
        const endDate = endOfMonth(targetDate)

        // Fetch All Missions in range for global stats
        const missions = await db.mission.findMany({
            where: {
                companyId: company.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                agent: {
                    include: { user: { select: { name: true } } }
                }
            }
        })

        // Calculate Stats
        const totalMissions = missions.length
        const completedMissions = missions.filter(m => m.status === 'COMPLETED').length
        const cancelledMissions = missions.filter(m => m.status === 'CANCELLED').length
        const fillRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0

        let totalSpend = 0
        const missionsWithCost = missions.map(m => {
            let cost = 0
            let duration = 0
            if (m.startTime && m.endTime && m.status === 'COMPLETED') {
                duration = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
                cost = Math.round(duration * 25)
                totalSpend += cost
            }
            return {
                id: m.id,
                title: m.title,
                status: m.status,
                agentName: m.agent?.user.name || 'Non assigné',
                cost,
                date: m.startTime
            }
        })

        // Monthly Spend History (Last 6 months)
        const sixMonthsAgo = subMonths(new Date(), 5)
        const historyStart = startOfMonth(sixMonthsAgo)

        const historyMissions = await db.mission.findMany({
            where: {
                companyId: company.id,
                status: 'COMPLETED',
                endTime: {
                    gte: historyStart
                }
            },
            select: {
                endTime: true,
                startTime: true
            }
        })

        const monthlyStats = []
        for (let i = 0; i < 6; i++) {
            const d = subMonths(new Date(), i)
            const monthStart = startOfMonth(d)
            const monthEnd = endOfMonth(d)
            const label = format(d, 'MMM', { locale: fr })

            const relevantMissions = historyMissions.filter(m =>
                m.endTime >= monthStart && m.endTime <= monthEnd
            )

            let monthSpend = 0
            relevantMissions.forEach(m => {
                const h = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
                monthSpend += Math.round(h * 25)
            })

            monthlyStats.unshift({
                name: label,
                spend: monthSpend
            })
        }

        return NextResponse.json({
            period: format(targetDate, 'MMMM yyyy', { locale: fr }),
            summary: {
                totalMissions,
                completedMissions,
                cancelledMissions,
                fillRate,
                totalSpend
            },
            missions: missionsWithCost,
            chartData: monthlyStats
        })

    } catch (error) {
        console.error('[REPORT_COMPANY_STATS]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
