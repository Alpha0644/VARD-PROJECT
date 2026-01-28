'use client'

import dynamic from 'next/dynamic'
import { ActiveMission } from '@/components/agent/active-mission'
import { MissionWithCompany } from '@/lib/types/mission'

// Dynamic import for map components (client-only due to Leaflet)
const AgentDashboardClient = dynamic(
    () => import('@/components/agent/dashboard/agent-dashboard-client').then(mod => mod.AgentDashboardClient),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/70 text-sm">Chargement...</span>
                </div>
            </div>
        )
    }
)

import { ExpirationAlert } from '@/components/agent/dashboard/expiration-alert'

interface AgentDashboardWrapperProps {
    activeMission: MissionWithCompany | null
    userId?: string
    expirationStatus?: {
        canOperate: boolean
        reason?: string
        warning?: string
    }
}

export function AgentDashboardWrapper({ activeMission, userId, expirationStatus }: AgentDashboardWrapperProps) {
    return (
        <div className="relative w-full h-full min-h-screen bg-gray-900">
            {expirationStatus && <ExpirationAlert status={expirationStatus} />}

            {activeMission ? (
                // Active Mission View - Full screen map with floating card
                <>
                    <div className="absolute inset-0 z-0">
                        <AgentDashboardClient hasActiveMission={true} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-6 pb-24">
                        <ActiveMission mission={activeMission} userId={userId} />
                    </div>
                </>
            ) : (
                // Job Board View - Map with bottom sheet
                <AgentDashboardClient hasActiveMission={false} />
            )}
        </div>
    )
}

