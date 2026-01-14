import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAgentLocation } from '@/lib/redis-geo'

export async function GET() {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const location = await getAgentLocation(session.user.id)

        return NextResponse.json({
            active: location !== null,
            location
        })
    } catch (error) {
        console.error('Get Location Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
