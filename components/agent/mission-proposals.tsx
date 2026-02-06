'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Clock, ArrowRight, Shield, Navigation, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { pusherClient } from '@/lib/pusher-client'
import { toast } from 'sonner'
import { MissionCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

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

interface MissionProposalsListProps {
    missions: PendingMission[]
    userPosition: [number, number] | null
    onAccept: (missionId: string) => void
    onReject?: (missionId: string) => void
    acceptingId: string | null
}

// Calculate distance between two points
const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export function MissionProposalsList({ missions, userPosition, onAccept, onReject, acceptingId }: MissionProposalsListProps) {
    // Sort by distance if position available
    const sortedMissions = [...missions].sort((a, b) => {
        if (!userPosition) return 0
        const distA = calculateDistance(userPosition[0], userPosition[1], a.latitude, a.longitude)
        const distB = calculateDistance(userPosition[0], userPosition[1], b.latitude, b.longitude)
        return distA - distB
    })

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {sortedMissions.map((mission, index) => {
                    const duration = (new Date(mission.endTime).getTime() - new Date(mission.startTime).getTime()) / (1000 * 60 * 60)
                    const estPrice = Math.round(duration * 25)
                    const distance = userPosition
                        ? calculateDistance(userPosition[0], userPosition[1], mission.latitude, mission.longitude)
                        : null

                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-gray-900 truncate">{mission.title}</h3>
                                        <p className="text-xs text-gray-500 truncate">{mission.company.companyName}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 ml-3">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                                            ~{estPrice}€
                                        </span>
                                        {distance !== null && (
                                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                                <Navigation className="w-3 h-3" />
                                                {distance.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="truncate max-w-[150px]">{mission.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>
                                            {new Date(mission.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(mission.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onAccept(mission.id)}
                                    disabled={acceptingId === mission.id}
                                    data-testid="mission-accept-btn"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    {acceptingId === mission.id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Acceptation...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Accepter</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </motion.button>

                                {/* Reject Button */}
                                {onReject && (
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onReject(mission.id)}
                                        data-testid="mission-reject-btn"
                                        className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Pas intéressé</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export function MissionProposals() {
    const [missions, setMissions] = useState<PendingMission[]>([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState<string | null>(null)
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Get user position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error('Geolocation error:', err)
            )
        }

        // Fetch initial missions
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
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(100)
            }
        })

        return () => {
            pusherClient.unsubscribe('public-missions')
        }
    }, [])

    const handleAccept = async (missionId: string) => {
        setAcceptingId(missionId)
        try {
            const res = await fetch(`/api/missions/${missionId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            })

            if (res.ok) {
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([50, 50, 100])
                }
                toast.success('Mission acceptée !', {
                    description: 'Préparez-vous à intervenir.'
                })
                router.refresh()
            } else {
                toast.error('Erreur', {
                    description: 'Impossible d\'accepter cette mission.'
                })
            }
        } catch (error) {
            console.error('Accept error:', error)
            toast.error('Erreur réseau', {
                description: 'Veuillez réessayer plus tard.'
            })
        } finally {
            setAcceptingId(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <MissionCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (missions.length === 0) {
        return (
            <EmptyState
                icon={Shield}
                title="Aucune mission disponible"
                description="Restez connecté, nous vous notifierons dès qu'une mission sera disponible."
            />
        )
    }

    return (
        <MissionProposalsList
            missions={missions}
            userPosition={userPosition}
            onAccept={handleAccept}
            acceptingId={acceptingId}
        />
    )
}

// Export for use in dashboard with bottom sheet
export { type PendingMission }
