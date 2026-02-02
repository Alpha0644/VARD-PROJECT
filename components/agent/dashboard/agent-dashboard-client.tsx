'use client'

import { useState, useEffect, useMemo } from 'react'
import { AgentMap } from '@/components/agent/map/agent-map'
import { BottomSheet } from '@/components/agent/ui/bottom-sheet'
import { MissionProposalsList } from '@/components/agent/mission-proposals'
import { MissionFiltersButton, MissionFilters, defaultFilters } from '@/components/agent/ui/mission-filters'
import { pusherClient } from '@/lib/pusher-client'
import { useRouter } from 'next/navigation'
import { Shield, FileBarChart, Bell, BellOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AgentReportingClient } from './agent-reporting-client'
import { LocationControl } from './location-control'
import { usePushNotifications } from '@/hooks/use-push-notifications'

import { toast } from 'sonner'

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
    userId?: string // Added userId prop
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

export function AgentDashboardClient({ hasActiveMission, userName, userId }: AgentDashboardClientProps) {
    // Immediate render log to verify mounting and props
    // console.log('[Dashboard] 🚀 Rendering Client Component', { hasActiveMission, userName, userId })

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
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    setUserPosition([latitude, longitude])

                    // Critical: Update Redis for Matching Engine
                    if (userId) {
                        fetch('/api/agent/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ latitude, longitude })
                        }).catch(e => console.error('[Dashboard] Location sync failed:', e))
                    }
                },
                (err) => console.warn('Geolocation warning:', err.message),
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
            )
        }

        // Subscribe to private channel for personal notifications (cancellation, etc.)
        if (userId) {
            // Must match backend: private-user-{userId}
            const privateChannel = pusherClient.subscribe(`private-user-${userId}`)

            // Event: Mission Cancelled
            privateChannel.bind('mission:cancelled', (data: any) => {
                toast.error(`Mission annulée: ${data.title || 'Une mission a été annulée'}`, {
                    duration: 5000,
                    action: {
                        label: 'Voir',
                        onClick: () => router.push('/agent/missions')
                    }
                })
                if (navigator.vibrate) navigator.vibrate([200, 100, 200])
                router.refresh()
            })

            // Event: New Personalized Mission (Nearby match)
            privateChannel.bind('mission:new', (data: any) => {
                toast.success(`🎯 Nouvelle mission proche: ${data.title}`, {
                    duration: 5000,
                    action: {
                        label: 'Voir',
                        onClick: () => router.push(data.link || '/agent/dashboard')
                    }
                })
                if (navigator.vibrate) navigator.vibrate([100, 50, 100])
                router.refresh()
            })

            privateChannel.bind('mission:update', (data: any) => {
                toast.info(`Mise à jour mission: ${data.title}`)
                router.refresh()
            })

            return () => {
                pusherClient.unsubscribe(`private-user-${userId}`)
            }
        } else {
            console.warn('[Dashboard] ⚠️ Skipping private subscription: No userId provided')
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

            // Real-time updates (Public)
            const channel = pusherClient.subscribe('public-missions')
            channel.bind('mission:created', (newMission: PendingMission) => {
                setMissions(prev => [newMission, ...prev])
                // Haptic feedback if available
                if (navigator.vibrate) navigator.vibrate(100)
                toast.info('Nouvelle mission disponible !')
            })

            return () => {
                pusherClient.unsubscribe('public-missions')
                // Unsubscribe private handled in separate effect or here if we have ID
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
    }, [hasActiveMission, userId]) // Added userId dependency

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

    const { isSubscribed, subscribe, isLoading: notifLoading, isSupported: notifSupported } = usePushNotifications()

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

            {/* Control Buttons - Top Left Stack */}
            <div className="absolute top-20 left-4 z-40 flex flex-col gap-3">
                {/* Reports Button */}
                <button
                    onClick={() => setView('REPORTS')}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all"
                    title="Rapports"
                >
                    <FileBarChart className="w-6 h-6 text-gray-700" />
                </button>

                {/* Location Control */}
                <LocationControl
                    userId={userId}
                    onLocationUpdate={(pos) => setUserPosition(pos)}
                />

                {/* Notification Button */}
                {notifSupported && (
                    <button
                        onClick={async () => {
                            if (!isSubscribed) {
                                try {
                                    await subscribe()
                                    toast.success('Notifications activées !')
                                } catch (err: any) {
                                    toast.error('Erreur Notification', {
                                        description: err.message
                                    })
                                }
                            } else {
                                toast.info('Notifications déjà actives')
                            }
                        }}
                        disabled={notifLoading}
                        className={`p-3 rounded-full shadow-lg border backdrop-blur-sm transition-all ${isSubscribed
                                ? 'bg-green-500/90 border-green-400 text-white'
                                : 'bg-white/90 border-orange-300 text-orange-600 hover:bg-white'
                            }`}
                        title={isSubscribed ? 'Notifications actives' : 'Activer les notifications'}
                    >
                        {notifLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isSubscribed ? (
                            <Bell className="w-6 h-6" />
                        ) : (
                            <BellOff className="w-6 h-6" />
                        )}
                    </button>
                )}
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
