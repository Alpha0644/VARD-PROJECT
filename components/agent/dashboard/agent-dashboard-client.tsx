'use client'

import { useState, useEffect, useMemo } from 'react'
import { AgentMap } from '@/components/agent/map/agent-map'
import { BottomSheet } from '@/components/agent/ui/bottom-sheet'
import { MissionProposalsList } from '@/components/agent/mission-proposals'
import { MissionFiltersButton, MissionFilters, defaultFilters } from '@/components/agent/ui/mission-filters'
import { pusherClient } from '@/lib/pusher-client'
import { useRouter } from 'next/navigation'
import { Shield, FileBarChart } from 'lucide-react' // Added FileBarChart
import { motion } from 'framer-motion'
import { AgentReportingClient } from './agent-reporting-client' // New Import

interface PendingMission {
    id: string
    title: string
    description?: string
    location: string
    startTime: string
    endTime: string
    latitude: number
    longitude: number
    company: {
        companyName: string
    }
}

interface AgentDashboardClientProps {
    hasActiveMission: boolean
    userName: string
}

// Calculate distance between two points in km
const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Calculate mission duration in hours
const getMissionDuration = (mission: PendingMission): number => {
    return (new Date(mission.endTime).getTime() - new Date(mission.startTime).getTime()) / (1000 * 60 * 60)
}

// Calculate estimated price
const getMissionPrice = (mission: PendingMission): number => {
    return Math.round(getMissionDuration(mission) * 25)
}

export function AgentDashboardClient({ hasActiveMission, userName }: AgentDashboardClientProps) {
    const [view, setView] = useState<'BOARD' | 'REPORTS'>('BOARD') // New State for Tabs
    const [missions, setMissions] = useState<PendingMission[]>([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState<string | null>(null)
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
    const [filters, setFilters] = useState<MissionFilters>(defaultFilters)
    const [rejectedIds, setRejectedIds] = useState<string[]>([])
    const router = useRouter()

    useEffect(() => {
        // Get user position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error('Geolocation error:', err)
            )
        }

        // Fetch missions if no active mission
        if (!hasActiveMission) {
            fetch('/api/missions/available')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setMissions(data)
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false))

            // Real-time updates
            const channel = pusherClient.subscribe('public-missions')
            channel.bind('mission:created', (newMission: PendingMission) => {
                setMissions(prev => [newMission, ...prev])
                if (navigator.vibrate) navigator.vibrate(100)
            })

            return () => {
                pusherClient.unsubscribe('public-missions')
            }
        } else {
            setLoading(false)
        }

        // Load rejected missions
        fetch('/api/agent/reject')
            .then(res => res.json())
            .then(data => {
                if (data.rejectedIds) {
                    setRejectedIds(data.rejectedIds)
                }
            })
            .catch(console.error)
    }, [hasActiveMission])

    // Filter and sort missions
    const filteredMissions = useMemo(() => {
        let result = missions.filter(m => !rejectedIds.includes(m.id))

        // Apply distance filter
        if (filters.maxDistance !== null && userPosition) {
            result = result.filter(m => {
                const dist = calculateDistance(userPosition[0], userPosition[1], m.latitude, m.longitude)
                return dist <= filters.maxDistance!
            })
        }

        // Apply duration filter
        if (filters.minDuration !== null || filters.maxDuration !== null) {
            result = result.filter(m => {
                const duration = getMissionDuration(m)
                if (filters.minDuration !== null && duration < filters.minDuration) return false
                if (filters.maxDuration !== null && duration > filters.maxDuration) return false
                return true
            })
        }

        // Apply price filter
        if (filters.minPrice !== null) {
            result = result.filter(m => getMissionPrice(m) >= filters.minPrice!)
        }

        // Sort
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'distance':
                    if (!userPosition) return 0
                    const distA = calculateDistance(userPosition[0], userPosition[1], a.latitude, a.longitude)
                    const distB = calculateDistance(userPosition[0], userPosition[1], b.latitude, b.longitude)
                    return distA - distB
                case 'price':
                    return getMissionPrice(b) - getMissionPrice(a)
                case 'date':
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                default:
                    return 0
            }
        })

        return result
    }, [missions, filters, userPosition])

    const handleAccept = async (missionId: string) => {
        setAcceptingId(missionId)
        try {
            const res = await fetch(`/api/missions/${missionId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            })

            if (res.ok) {
                if (navigator.vibrate) navigator.vibrate([50, 50, 100])
                router.refresh()
            } else {
                alert('Erreur lors de l\'acceptation')
            }
        } catch (error) {
            console.error('Accept error:', error)
            alert('Erreur réseau')
        } finally {
            setAcceptingId(null)
        }
    }

    const handleReject = async (missionId: string) => {
        // Optimistic update
        setRejectedIds(prev => [...prev, missionId])
        if (navigator.vibrate) navigator.vibrate(50)

        // Persist to server
        try {
            await fetch('/api/agent/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ missionId })
            })
        } catch (error) {
            console.error('Reject error:', error)
        }
    }

    const handleMissionClick = (mission: PendingMission) => {
    }

    // If active mission, just show map without bottom sheet
    if (hasActiveMission) {
        return (
            <div className="absolute inset-0">
                <AgentMap missions={[]} />
            </div>
        )
    }

    // Toggle View for Reports
    if (view === 'REPORTS') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold">Rapports & Activité</h1>
                    <button
                        onClick={() => setView('BOARD')}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Fermer
                    </button>
                </header>
                <div className="flex-1 p-4 pb-24 overflow-y-auto">
                    <AgentReportingClient userName={userName} />
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-full w-full">
            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <AgentMap
                    missions={filteredMissions}
                    onMissionClick={handleMissionClick}
                />
            </div>

            {/* Reports Button - Top Left */}
            <div className="absolute top-20 left-4 z-40">
                <button
                    onClick={() => setView('REPORTS')}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all"
                >
                    <FileBarChart className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Filters Button - Top Right */}
            <div className="absolute top-20 right-4 z-40">
                <MissionFiltersButton
                    filters={filters}
                    onFiltersChange={setFilters}
                    missionCount={filteredMissions.length}
                />
            </div>

            {/* Bottom Sheet with Missions */}
            <BottomSheet
                title="Missions disponibles"
                badge={filteredMissions.length}
                defaultState="collapsed"
            >
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredMissions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            {missions.length > 0 ? 'Aucun résultat' : 'Aucune mission'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {missions.length > 0
                                ? 'Essayez d\'ajuster vos filtres.'
                                : 'Les nouvelles missions apparaîtront ici.'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <MissionProposalsList
                        missions={filteredMissions}
                        userPosition={userPosition}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        acceptingId={acceptingId}
                    />
                )}
            </BottomSheet>
        </div>
    )
}
