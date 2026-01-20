import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }



        const notifications = await db.missionNotification.findMany({
            where: {
                agentId: session.user.id,
                status: 'SENT' // Only show new proposals
            },
            include: {
                mission: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        startTime: true,
                        endTime: true,
                        company: {
                            select: { companyName: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })



        return NextResponse.json(notifications)
    } catch (error) {
        console.error('Fetch Notifications Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
