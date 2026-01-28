'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Clock, Building2, ChevronRight, CheckCircle, Navigation, XCircle } from 'lucide-react'
import { pusherClient } from '@/lib/pusher-client'

import { MissionWithCompany } from '@/lib/types/mission'
import { AutoTracker } from './auto-tracker'

interface ActiveMissionProps {
    mission: MissionWithCompany
    userId?: string
}

const STATUS_FLOW = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] as const

const statusConfig: Record<string, { label: string, emoji: string, color: string }> = {
    'ACCEPTED': { label: 'Mission acceptée', emoji: '✓', color: 'bg-blue-500' },
    'EN_ROUTE': { label: 'En route', emoji: '🚗', color: 'bg-indigo-500' },
    'ARRIVED': { label: 'Sur place', emoji: '📍', color: 'bg-purple-500' },
    'IN_PROGRESS': { label: 'En cours', emoji: '▶️', color: 'bg-cyan-500' },
    'COMPLETED': { label: 'Terminée', emoji: '✅', color: 'bg-green-500' },
    'CANCELLED': { label: 'Annulée', emoji: '❌', color: 'bg-red-500' },
}

const nextStatusLabels: Record<string, { label: string, emoji: string }> = {
    'EN_ROUTE': { label: 'Je suis en route', emoji: '🚗' },
    'ARRIVED': { label: 'Je suis arrivé', emoji: '📍' },
    'IN_PROGRESS': { label: 'Commencer', emoji: '▶️' },
    'COMPLETED': { label: 'Terminer la mission', emoji: '✅' },
}

export function ActiveMission({ mission, userId }: ActiveMissionProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(mission.status)
    const [isCancelled, setIsCancelled] = useState(false)
    const [cancelMessage, setCancelMessage] = useState('')
    const router = useRouter()

    // Listen for mission cancellation via Pusher
    useEffect(() => {
        if (!userId) return

        const channelName = `private-user-${userId}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind('mission:cancelled', (data: { missionId: string, missionTitle: string, message: string }) => {
            if (data.missionId === mission.id) {
                setIsCancelled(true)
                setCancelMessage(data.message || 'Cette mission a été annulée par l\'agence.')
                // Vibrate to alert
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200])
                }
            }
        })

        return () => {
            channel.unbind('mission:cancelled')
            pusherClient.unsubscribe(channelName)
        }
    }, [userId, mission.id])

    const handleStatusUpdate = async (newStatus: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/missions/${mission.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Update failed')

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100])
            }

            setCurrentStatus(newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Erreur lors de la mise à jour')
        } finally {
            setIsLoading(false)
        }
    }

    const getNextStatus = (status: string) => {
        const index = STATUS_FLOW.indexOf(status as typeof STATUS_FLOW[number])
        if (index === -1 || index === STATUS_FLOW.length - 1) return null
        return STATUS_FLOW[index + 1]
    }

    const nextStatus = getNextStatus(currentStatus)
    const currentConfig = statusConfig[currentStatus] || statusConfig['ACCEPTED']
    const progress = (STATUS_FLOW.indexOf(currentStatus as typeof STATUS_FLOW[number]) + 1) / STATUS_FLOW.length

    // Cancelled state (real-time from Pusher)
    if (isCancelled) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Mission Annulée</h3>
                        <p className="text-red-100 text-sm">{cancelMessage}</p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.refresh()}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur py-3 rounded-xl font-medium transition-colors"
                >
                    Retour aux missions
                </motion.button>
            </motion.div>
        )
    }

    // Completed state
    if (currentStatus === 'COMPLETED') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Mission Terminée !</h3>
                        <p className="text-green-100 text-sm">Bravo pour votre travail</p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.refresh()}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur py-3 rounded-xl font-medium transition-colors"
                >
                    Retour aux missions
                </motion.button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
            {/* Header with gradient */}
            <div className={`${currentConfig.color} px-5 py-4`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentConfig.emoji}</span>
                        <div>
                            <h3 className="font-bold text-white text-lg">Mission en cours</h3>
                            <p className="text-white/80 text-xs">{currentConfig.label}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-xs">Progression</p>
                        <p className="text-white font-bold">{Math.round(progress * 100)}%</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Mission Title */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{mission.title}</h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Building2 className="w-4 h-4" />
                        <span>{mission.company.companyName}</span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Lieu</span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm truncate">{mission.location}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Horaire</span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">
                            {new Date(mission.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(mission.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Navigate Button */}
                <motion.a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mission.location)}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
                >
                    <Navigation className="w-4 h-4" />
                    <span>Y aller (Google Maps)</span>
                </motion.a>

                {/* Description */}
                {mission.description && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-blue-800 text-sm">{mission.description}</p>
                    </div>
                )}

                {/* Auto-Tracking (Hidden) */}
                <AutoTracker missionId={mission.id} status={currentStatus} />

                {/* Status Steps */}
                <div className="flex justify-between pt-2">
                    {STATUS_FLOW.map((status, idx) => {
                        const isPast = STATUS_FLOW.indexOf(currentStatus as typeof STATUS_FLOW[number]) >= idx
                        const isCurrent = currentStatus === status
                        return (
                            <div key={status} className="flex flex-col items-center flex-1">
                                <motion.div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isPast
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {isPast ? '✓' : idx + 1}
                                </motion.div>
                            </div>
                        )
                    })}
                </div>

                {/* Action Button */}
                {nextStatus && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusUpdate(nextStatus)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Mise à jour...</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-xl">{nextStatusLabels[nextStatus]?.emoji}</span>
                                <span>{nextStatusLabels[nextStatus]?.label}</span>
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    )
}
