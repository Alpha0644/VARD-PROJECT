import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, parseISO, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        // Default to last 6 months for trends

        // 1. Global KPIs
        const [totalAgents, totalCompanies, activeMissionsCount] = await Promise.all([
            db.user.count({ where: { role: 'AGENT' } }),
            db.user.count({ where: { role: 'COMPANY' } }),
            db.mission.count({ where: { status: { in: ['ACCEPTED', 'IN_PROGRESS', 'EN_ROUTE', 'ARRIVED'] } } })
        ])

        // 2. Platform Revenue / Activity History (Last 6 Months)
        const sixMonthsAgo = subMonths(new Date(), 5)
        const historyStart = startOfMonth(sixMonthsAgo)

        const historyMissions = await db.mission.findMany({
            where: {
                status: 'COMPLETED',
                endTime: { gte: historyStart }
            },
            select: {
                startTime: true,
                endTime: true
            }
        })

        const monthlyActivity = []
        for (let i = 0; i < 6; i++) {
            const d = subMonths(new Date(), i)
            const monthStart = startOfMonth(d)
            const monthEnd = endOfMonth(d)
            const label = format(d, 'MMM', { locale: fr })

            const relevantMissions = historyMissions.filter(m =>
                m.endTime >= monthStart && m.endTime <= monthEnd
            )

            // Calculate Volume for this month
            let volume = 0
            relevantMissions.forEach(m => {
                const h = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
                volume += Math.round(h * 25) // Estimate 25€/h volume
            })

            monthlyActivity.unshift({
                name: label,
                volume: volume,
                count: relevantMissions.length
            })
        }

        return NextResponse.json({
            kpis: {
                totalAgents,
                totalCompanies,
                activeMissionsCount,
                totalVolume: monthlyActivity.reduce((acc, curr) => acc + curr.volume, 0)
            },
            charts: {
                monthlyActivity
            }
        })

    } catch (error) {
        console.error('[REPORT_ADMIN_STATS]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
