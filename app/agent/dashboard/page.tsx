import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AgentDashboardWrapper } from '@/components/agent/dashboard/agent-dashboard-wrapper'

import { checkAgentCanOperate } from '@/lib/documents'

export default async function AgentDashboardPage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    const agent = await db.agent.findUnique({
        where: { userId: session.user.id }
    })

    if (!agent) redirect('/login')

    // Check expiration status
    const expirationStatus = await checkAgentCanOperate(session.user.id)

    // Check for active mission
    const activeMission = await db.mission.findFirst({
        where: {
            agentId: agent.id,
            status: { in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
        },
        include: {
            company: true
        }
    })

    return <AgentDashboardWrapper
        activeMission={activeMission}
        userId={session.user.id}
        userName={session.user.name || 'Agent'}
        expirationStatus={expirationStatus}
    />
}

