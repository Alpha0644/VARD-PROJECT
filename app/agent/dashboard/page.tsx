import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AgentMap } from '@/components/agent/map/agent-map'
import { MissionProposals } from '@/components/agent/mission-proposals'
import { ActiveMission } from '@/components/agent/active-mission'

export default async function AgentDashboardPage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    const agent = await db.agent.findUnique({
        where: { userId: session.user.id }
    })

    if (!agent) redirect('/login')

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

    return (
        <div className="relative w-full h-full min-h-screen bg-gray-100">
            {/* Full Screen Map (Always visible in background) */}
            <div className="absolute inset-0 z-0">
                <AgentMap />
            </div>

            {/* Content Layer */}
            {activeMission ? (
                // Active Mission View (Floating Card)
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-6 pb-24">
                    <ActiveMission mission={activeMission} />
                </div>
            ) : (
                // Job Board (Proposals List)
                <MissionProposals />
            )}
        </div>
    )
}
