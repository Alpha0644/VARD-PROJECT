'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, CheckCircle, Clock, User } from 'lucide-react'
import Link from 'next/link'

interface ActivityEvent {
    id: string
    type: 'status_change' | 'mission_created' | 'agent_assigned'
    missionId: string
    missionTitle: string
    agentName?: string
    status?: string
    timestamp: Date
}

interface LiveActivityFeedProps {
    companyId: string
    initialEvents?: ActivityEvent[]
}

const statusLabels: Record<string, { label: string, icon: typeof MapPin, color: string }> = {
    'ACCEPTED': { label: 'Mission acceptée', icon: CheckCircle, color: 'text-blue-500' },
    'EN_ROUTE': { label: 'Agent en route', icon: ArrowRight, color: 'text-amber-500' },
    'ARRIVED': { label: 'Agent arrivé', icon: MapPin, color: 'text-purple-500' },
    'IN_PROGRESS': { label: 'Mission en cours', icon: Clock, color: 'text-cyan-500' },
    'COMPLETED': { label: 'Mission terminée', icon: CheckCircle, color: 'text-green-500' },
}

export function LiveActivityFeed({ companyId, initialEvents = [] }: LiveActivityFeedProps) {
    const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const channelName = `private-company-${companyId}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true)
        })

        channel.bind('mission:status', (data: {
            missionId: string
            title: string
            status: string
            agentName?: string
        }) => {
            const newEvent: ActivityEvent = {
                id: `${data.missionId}-${Date.now()}`,
                type: 'status_change',
                missionId: data.missionId,
                missionTitle: data.title,
                agentName: data.agentName,
                status: data.status,
                timestamp: new Date()
            }
            setEvents(prev => [newEvent, ...prev].slice(0, 10))
        })

        return () => {
            pusherClient.unsubscribe(channelName)
        }
    }, [companyId])

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Activité en direct</h3>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
                <span className="text-xs text-gray-500">{events.length} événement{events.length > 1 ? 's' : ''}</span>
            </div>

            {/* Events List */}
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Aucune activité récente</p>
                            <p className="text-xs text-gray-400 mt-1">Les mises à jour apparaîtront ici</p>
                        </div>
                    ) : (
                        events.map((event) => {
                            const config = event.status ? statusLabels[event.status] : null
                            const Icon = config?.icon || Clock

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="px-5 py-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 ${config?.color || 'text-gray-400'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {event.missionTitle}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {config?.label || event.type}
                                                {event.agentName && (
                                                    <span className="ml-1">
                                                        • <User className="w-3 h-3 inline" /> {event.agentName}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-gray-400">
                                                {formatTime(event.timestamp)}
                                            </span>
                                            <Link
                                                href={`/company/missions/${event.missionId}`}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Voir
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
