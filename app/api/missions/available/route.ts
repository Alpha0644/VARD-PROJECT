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

        // Fetch all PENDING missions with coordinates for map display
        const missions = await db.mission.findMany({
            where: { status: 'PENDING' },
            include: {
                company: {
                    select: { companyName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Use real coordinates from DB
        const missionsWithCoords = missions.map(mission => ({
            ...mission,
            latitude: mission.latitude || 48.8566, // Fallback if missing
            longitude: mission.longitude || 2.3522
        }))

        return NextResponse.json(missionsWithCoords)

    } catch (error) {
        console.error('Fetch Available Missions Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
