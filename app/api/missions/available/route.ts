import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const agent = await db.agent.findUnique({
            where: { userId: session.user.id }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Profil agent introuvable' }, { status: 404 })
        }

        // Fetch all PENDING missions
        // In a real app, we would filter by location (radius)
        const missions = await db.mission.findMany({
            where: { status: 'PENDING' },
            include: {
                company: {
                    select: { companyName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(missions)

    } catch (error) {
        console.error('Fetch Available Missions Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
