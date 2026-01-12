import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * RGPD Article 20 - Data Portability
 * Export all user data in machine-readable format (JSON)
 */
export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const userId = session.user.id
        const userRole = session.user.role

        // Fetch user info and documents first
        const [user, documents] = await Promise.all([
            db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            db.document.findMany({
                where: { userId },
                select: {
                    id: true,
                    type: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    expiresAt: true,
                },
            }),
        ])

        // Fetch profile based on role
        let profile = null
        let profileId: string | null = null

        if (userRole === 'AGENT') {
            const agent = await db.agent.findUnique({
                where: { userId },
                select: {
                    id: true,
                    cartePro: true,
                    carteProExp: true,
                    latitude: true,
                    longitude: true,
                },
            })
            profile = agent
            profileId = agent?.id || null
        } else if (userRole === 'COMPANY') {
            const company = await db.company.findUnique({
                where: { userId },
                select: {
                    id: true,
                    companyName: true,
                    siren: true,
                    address: true,
                },
            })
            profile = company
            profileId = company?.id || null
        }

        // Fetch missions if profile exists
        type MissionExport = {
            id: string
            title: string
            description: string | null
            location: string
            status: string
            startTime: Date
            endTime: Date
            createdAt: Date
        }

        let missions: MissionExport[] = []
        if (profileId) {
            missions = await db.mission.findMany({
                where: userRole === 'AGENT'
                    ? { agentId: profileId }
                    : { companyId: profileId },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    status: true,
                    startTime: true,
                    endTime: true,
                    createdAt: true,
                },
            })
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            user,
            profile,
            documents,
            missions,
        }

        // Return as downloadable JSON
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="vard-data-export-${userId}-${Date.now()}.json"`,
            },
        })
    } catch (error) {
        console.error('Data export error:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
    }
}
