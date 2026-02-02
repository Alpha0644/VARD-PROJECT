'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { Bell, X, Check, MapPin, Clock, User, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Backup sound/toast

interface MissionUpdate {
    id: string
    type: 'new' | 'cancelled' | 'status_change'
    missionId: string
    missionTitle: string
    message: string
    link?: string
    timestamp: Date
}

interface AgentRealTimeNotificationsProps {
    userId: string
}

export function AgentRealTimeNotifications({ userId }: AgentRealTimeNotificationsProps) {
    // console.log('[Notif] Mounting Global Notifications (v3-toast-backup)')
    const [notifications, setNotifications] = useState<MissionUpdate[]>([])
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        // Subscribe to user's private channel
        // Must match backend: private-user-{userId}
        console.log(`[Pusher] Subscribing to: private-user-${userId}`)
        const channel = pusherClient.subscribe(`private-user-${userId}`)

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('[Pusher] ✅ Subscription succeeded!')
        })

        channel.bind('pusher:subscription_error', (status: any) => {
            console.error('[Pusher] ❌ Subscription error:', status)
        })

        // 1. Listen for NEW Missions (Matching Engine)
        channel.bind('mission:new', (data: {
            missionId: string
            title: string
            link?: string
        }) => {
            console.log('[Pusher] NEW MISSION RECEIVED', data)
            addNotification({
                type: 'new',
                missionId: data.missionId,
                missionTitle: data.title,
                message: 'Nouvelle mission disponible à proximité !',
                link: data.link || '/agent/dashboard'
            })
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        })

        // 2. Listen for CANCELLED Missions
        channel.bind('mission:cancelled', (data: {
            id: string // mission ID
            title: string
        }) => {
            console.log('[Pusher] CANCEL RECEIVED', data)
            try {
                // 1. Custom UI
                addNotification({
                    type: 'cancelled',
                    missionId: data.id,
                    missionTitle: data.title,
                    message: 'L\'entreprise a annulé cette mission.'
                })

                // 2. Toast Backup (in case visual UI fails or is hidden)
                toast.error(`🚫 Mission Annulée: ${data.title}`, {
                    duration: 8000,
                    position: 'top-center',
                    className: 'z-[9999]'
                })

                // 3. Vibration
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([500, 100, 500])
                }
            } catch (err) {
                console.error('[Pusher] Error handling cancellation:', err)
            }
        })

        return () => {
            channel.unbind_all()
            pusherClient.unsubscribe(`private-user-${userId}`)
        }
    }, [userId, router])


    const addNotification = (notif: Omit<MissionUpdate, 'id' | 'timestamp'>) => {
        const id = `${notif.missionId}-${Date.now()}`
        const newNotif = { ...notif, id, timestamp: new Date() }

        setNotifications(prev => [newNotif, ...prev].slice(0, 5))

        // Auto-close after 10 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }, 10000)
    }

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const handleClick = (notification: MissionUpdate) => {
        if (notification.link) {
            router.push(notification.link)
        }
        dismissNotification(notification.id)
    }

    const getIconForType = (type: MissionUpdate['type']) => {
        switch (type) {
            case 'new': return <Shield className="w-6 h-6 text-blue-500" />
            case 'cancelled': return <X className="w-6 h-6 text-red-500" />
            default: return <Bell className="w-6 h-6 text-gray-500" />
        }
    }

    const getBgForType = (type: MissionUpdate['type']) => {
        switch (type) {
            case 'new': return 'bg-blue-50 border-blue-200'
            case 'cancelled': return 'bg-red-50 border-red-200'
            default: return 'bg-white border-gray-200'
        }
    }

    return (
        <div className="fixed top-24 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none px-2 sm:px-0">
            {/* <div className="pointer-events-auto bg-black text-white p-2 rounded text-xs absolute -top-10 right-0 cursor-pointer shadow-lg z-50 border border-white/20" onClick={() => addNotification({
                type: 'cancelled',
                missionId: 'debug',
                missionTitle: 'Test Mission Debug',
                message: 'Ceci est un test de notification'
            })}>
                Test Notif
            </div> */}

            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        // Force opacity 1 for debug if needed, but keeping animation for now
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        className={`p-4 rounded-xl border shadow-xl pointer-events-auto cursor-pointer relative overflow-hidden ${getBgForType(notification.type)} backdrop-blur-md`}
                        onClick={() => handleClick(notification)}
                        layout
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">
                                    {notification.missionTitle}
                                </p>
                                <p className="text-sm text-gray-700 mt-1 font-medium leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> À l&apos;instant
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dismissNotification(notification.id)
                                }}
                                className="p-1 hover:bg-black/5 rounded-full transition-colors absolute top-2 right-2"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Progress bar effect could be added here */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-black/5"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
