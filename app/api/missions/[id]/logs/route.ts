import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const session = await auth()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const missionId = params.id

        // Check if user has access to this mission
        const mission = await db.mission.findUnique({
            where: { id: missionId },
            include: { company: true, agent: true }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        // Authorization check
        let isAuthorized = false
        if (session.user.role === 'ADMIN') isAuthorized = true

        if (session.user.role === 'COMPANY') {
            // Check if company owns the mission
            const company = await db.company.findUnique({ where: { userId: session.user.id } })
            if (company && mission.companyId === company.id) isAuthorized = true
        }

        if (session.user.role === 'AGENT') {
            // Check if agent is assigned to the mission
            const agent = await db.agent.findUnique({ where: { userId: session.user.id } })
            if (agent && mission.agentId === agent.id) isAuthorized = true
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Accès non autorisé à cette mission' }, { status: 403 })
        }

        // Fetch logs
        const logs = await db.missionLog.findMany({
            where: { missionId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        })

        return NextResponse.json({ data: logs })

    } catch (error) {
        console.error('Mission Logs API Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
