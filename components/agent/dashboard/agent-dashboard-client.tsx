'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { BottomSheet } from '@/components/agent/ui/bottom-sheet'
import { MissionProposalsList } from '@/components/agent/mission-proposals'
import { MissionFiltersButton, MissionFilters, defaultFilters } from '@/components/agent/ui/mission-filters'
import { pusherClient } from '@/lib/pusher-client'
import { useRouter } from 'next/navigation'
import { Shield, Loader2, Bell, BellOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { LocationControl } from './location-control'
import { usePushNotifications } from '@/hooks/use-push-notifications'

// Dynamic Imports
const AgentMap = dynamic(() => import('@/components/agent/map/agent-map').then(mod => mod.AgentMap), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
})
const AgentReportingClient = dynamic(() => import('./agent-reporting-client').then(mod => mod.AgentReportingClient), {
    loading: () => <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
})

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

        // ✅ FIX: Private channel is owned ONLY by AgentRealTimeNotifications
        // No duplicate subscription here — prevents channel kill on cleanup

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

            // Real-time updates (Public channel — no auth needed)
            const channel = pusherClient.subscribe('public-missions')
            channel.bind('mission:created', (newMission: PendingMission) => {
                setMissions(prev => [newMission, ...prev])
                if (navigator.vibrate) navigator.vibrate(100)
                toast.info('Nouvelle mission disponible !')
            })

            // Load rejected missions
            fetch('/api/agent/reject')
                .then(res => res.json())
                .then(data => {
                    if (data.rejectedIds) {
                        setRejectedIds(data.rejectedIds)
                    }
                })
                .catch(console.error)

            return () => {
                pusherClient.unsubscribe('public-missions')
            }
        } else {
            setLoading(false)
        }
    }, [hasActiveMission, userId])

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

    // Auto-subscribe to push notifications on dashboard load
    useEffect(() => {
        let mounted = true

        const autoSubscribe = async () => {
            if (notifSupported && !isSubscribed && !notifLoading) {
                try {
                    await subscribe()
                    // Don't toast on auto-subscribe success to avoid spam
                } catch (err) {
                    console.warn('[Dash] Auto-subscribe failed (User may have denied):', err)
                }
            }
        }

        // Slight delay to not block initial render
        const timer = setTimeout(autoSubscribe, 2000)

        return () => {
            mounted = false
            clearTimeout(timer)
        }
    }, [notifSupported, isSubscribed, notifLoading, subscribe])

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

            {/* Left Side Controls — Location + Filters + Notif */}
            <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-4 z-40 flex flex-col gap-2.5">
                {/* Location Control */}
                <LocationControl
                    userId={userId}
                    onLocationUpdate={(pos) => setUserPosition(pos)}
                />

                {/* Filters Button */}
                <MissionFiltersButton
                    filters={filters}
                    onFiltersChange={setFilters}
                    missionCount={filteredMissions.length}
                />

                {/* Notification Toggle */}
                {notifSupported && (
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={async () => {
                            if (!isSubscribed) {
                                try {
                                    await subscribe()
                                    toast.success('Notifications activées')
                                } catch {
                                    toast.error('Impossible d\'activer les notifications')
                                }
                            } else {
                                toast.info('Notifications déjà actives')
                            }
                        }}
                        disabled={notifLoading}
                        className={`w-11 h-11 rounded-full shadow-lg border backdrop-blur-xl flex items-center justify-center transition-all ${isSubscribed
                            ? 'bg-black/50 border-green-400/40'
                            : 'bg-black/50 border-white/15'
                            }`}
                    >
                        {notifLoading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : isSubscribed ? (
                            <Bell className="w-5 h-5 text-green-400" />
                        ) : (
                            <BellOff className="w-5 h-5 text-white/50" />
                        )}
                    </motion.button>
                )}
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
