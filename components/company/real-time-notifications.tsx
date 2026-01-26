'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { Bell, X, Check, MapPin, Clock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MissionUpdate {
    id: string
    type: 'accepted' | 'started' | 'completed' | 'cancelled'
    missionId: string
    missionTitle: string
    agentName?: string
    message: string
    timestamp: Date
}

interface RealTimeNotificationsProps {
    userId: string
}

export function RealTimeNotifications({ userId }: RealTimeNotificationsProps) {
    const [notifications, setNotifications] = useState<MissionUpdate[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!userId) return

        // Subscribe to user's private channel
        const channel = pusherClient.subscribe(`private-company-${userId}`)

        // Listen for mission status updates
        channel.bind('mission:status-change', (data: {
            missionId: string
            missionTitle: string
            previousStatus: string
            newStatus: string
            agentName?: string
        }) => {
            const typeMap: Record<string, MissionUpdate['type']> = {
                ACCEPTED: 'accepted',
                IN_PROGRESS: 'started',
                COMPLETED: 'completed',
                CANCELLED: 'cancelled',
            }

            const messageMap: Record<string, string> = {
                ACCEPTED: `${data.agentName || 'Un agent'} a accepté la mission`,
                EN_ROUTE: `${data.agentName || 'L\'agent'} est en route`,
                ARRIVED: `${data.agentName || 'L\'agent'} est arrivé sur place`,
                IN_PROGRESS: `Mission démarrée`,
                COMPLETED: `Mission terminée avec succès`,
                CANCELLED: `Mission annulée`,
            }

            const notification: MissionUpdate = {
                id: `${data.missionId}-${Date.now()}`,
                type: typeMap[data.newStatus] || 'accepted',
                missionId: data.missionId,
                missionTitle: data.missionTitle,
                agentName: data.agentName,
                message: messageMap[data.newStatus] || `Statut: ${data.newStatus}`,
                timestamp: new Date(),
            }

            setNotifications(prev => [notification, ...prev].slice(0, 10))

            // Auto-open panel on new notification
            setIsOpen(true)

            // Auto-close after 5 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id))
            }, 10000)
        })

        return () => {
            channel.unbind_all()
            pusherClient.unsubscribe(`private-company-${userId}`)
        }
    }, [userId])

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getIconForType = (type: MissionUpdate['type']) => {
        switch (type) {
            case 'accepted': return <User className="w-5 h-5 text-blue-500" />
            case 'started': return <Clock className="w-5 h-5 text-green-500" />
            case 'completed': return <Check className="w-5 h-5 text-green-600" />
            case 'cancelled': return <X className="w-5 h-5 text-red-500" />
        }
    }

    const getBgForType = (type: MissionUpdate['type']) => {
        switch (type) {
            case 'accepted': return 'bg-blue-50 border-blue-200'
            case 'started': return 'bg-green-50 border-green-200'
            case 'completed': return 'bg-green-50 border-green-200'
            case 'cancelled': return 'bg-red-50 border-red-200'
        }
    }

    return (
        <>
            {/* Floating notifications */}
            <div className="fixed top-24 right-6 z-[9999] space-y-3 max-w-sm pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`p-4 rounded-xl border shadow-lg ${getBgForType(notification.type)} pointer-events-auto bg-white`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {getIconForType(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {notification.missionTitle}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        À l&apos;instant
                                    </p>
                                </div>
                                <button
                                    onClick={() => dismissNotification(notification.id)}
                                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}
