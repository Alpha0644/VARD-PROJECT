import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, parseISO, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const dateParam = searchParams.get('date') // YYYY-MM

        let targetDate = new Date()
        if (dateParam) {
            targetDate = parseISO(`${dateParam}-01`)
        }

        const startDate = startOfMonth(targetDate)
        const endDate = endOfMonth(targetDate)

        // Fetch Agent ID
        const agent = await db.agent.findUnique({
            where: { userId: session.user.id }
        })

        if (!agent) return new NextResponse('Agent not found', { status: 404 })

        // Fetch Completed Missions in range
        const missions = await db.mission.findMany({
            where: {
                agentId: agent.id,
                status: 'COMPLETED',
                endTime: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                company: {
                    select: { companyName: true }
                }
            }
        })

        // Calculate Stats
        let totalHours = 0
        let totalRevenue = 0 // Est. 25€/h

        const missionsWithDetails = missions.map(m => {
            const start = new Date(m.startTime)
            const end = new Date(m.endTime)
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            const revenue = Math.round(hours * 25)

            totalHours += hours
            totalRevenue += revenue

            return {
                ...m,
                hours: Number(hours.toFixed(2)),
                revenue
            }
        })

        // Monthly History for Charts (Last 6 months)
        const sixMonthsAgo = subMonths(new Date(), 5)
        const historyStart = startOfMonth(sixMonthsAgo)

        const historyMissions = await db.mission.findMany({
            where: {
                agentId: agent.id,
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

            let monthRevenue = 0
            relevantMissions.forEach(m => {
                const h = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
                monthRevenue += Math.round(h * 25)
            })

            monthlyStats.unshift({
                name: label,
                revenue: monthRevenue
            })
        }

        return NextResponse.json({
            period: format(targetDate, 'MMMM yyyy', { locale: fr }),
            summary: {
                totalMissions: missions.length,
                totalHours: Number(totalHours.toFixed(2)),
                totalRevenue
            },
            missions: missionsWithDetails,
            chartData: monthlyStats
        })

    } catch (error) {
        console.error('[REPORT_AGENT_STATS]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
