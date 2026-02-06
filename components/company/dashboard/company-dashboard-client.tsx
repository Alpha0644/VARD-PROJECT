'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { LiveActivityFeed } from './live-activity-feed'
import { LayoutDashboard, BarChart3, Loader2 } from 'lucide-react'

// Dynamic imports
const CompanyReportingClient = dynamic(
    () => import('./company-reporting-client').then(mod => mod.CompanyReportingClient),
    {
        ssr: false,
        loading: () => <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }
)

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
    userName: string
}

export function CompanyDashboardClient({ missions, companyId, userName }: DashboardClientProps) {
    const [view, setView] = useState<'COMMAND' | 'ANALYTICS'>('COMMAND')

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1 mb-6">
                <button
                    onClick={() => setView('COMMAND')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${view === 'COMMAND'
                        ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Vue Globale
                </button>
                <button
                    onClick={() => setView('ANALYTICS')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${view === 'ANALYTICS'
                        ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Analytiques & Rapports
                </button>
            </div>

            {view === 'COMMAND' ? (
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
            ) : (
                <CompanyReportingClient userName={userName} />
            )}
        </div>
    )
}
