'use client'

import dynamic from 'next/dynamic'
import { LiveActivityFeed } from './live-activity-feed'

// Dynamic import for MissionsMap to avoid SSR issues with Leaflet
const MissionsMap = dynamic(
    () => import('./missions-map').then(mod => mod.MissionsMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }
)

interface Mission {
    id: string
    title: string
    location: string
    status: string
    latitude: number
    longitude: number
    agent?: {
        id: string
        user: {
            name: string
        }
    }
}

interface DashboardClientProps {
    missions: Mission[]
    companyId: string
}

export function CompanyDashboardClient({ missions, companyId }: DashboardClientProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map - takes 2 columns */}
            <div className="lg:col-span-2">
                <MissionsMap missions={missions} companyId={companyId} />
            </div>

            {/* Live Activity Feed - 1 column */}
            <div>
                <LiveActivityFeed companyId={companyId} />
            </div>
        </div>
    )
}
