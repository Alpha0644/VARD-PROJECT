'use client'

import { User, TrendingUp, Loader2, Bell, BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePushNotifications } from '@/hooks/use-push-notifications'

interface AgentStats {
    user: {
        image: string | null
        name: string | null
    }
    month: {
        completedCount: number
        totalHours: number
        estimatedEarnings: number
    }
    current: {
        activeMissions: number
        availableMissions: number
    }
}

export function AgentTopBar() {
    const [stats, setStats] = useState<AgentStats | null>(null)
    const [loading, setLoading] = useState(true)

    const {
        isSupported,
        isSubscribed,
        isLoading: pushLoading,
        subscribe,
        unsubscribe
    } = usePushNotifications()

    useEffect(() => {
        fetch('/api/agent/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setStats(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleNotifToggle = async () => {
        if (isSubscribed) {
            await unsubscribe()
        } else {
            try {
                await subscribe()
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([50, 50, 50])
                }
            } catch (error) {
                console.error('Subscription failed', error)
            }
        }
    }

    const earnings = stats?.month.estimatedEarnings ?? 0
    const userImage = stats?.user?.image

    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex justify-between items-center pointer-events-none">
            {/* Left side: Profile + Notifications */}
            <div className="flex items-center gap-2 pointer-events-auto">
                {/* Profile Button */}
                <Link href="/agent/profile/edit">
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors overflow-hidden"
                    >
                        {userImage ? (
                            <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-white" />
                        )}
                    </motion.div>
                </Link>

                {/* Notification Toggle */}
                {isSupported && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNotifToggle}
                        disabled={pushLoading}
                        className={`w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-lg transition-colors ${isSubscribed
                            ? 'bg-green-500/40 border-green-400/40 hover:bg-green-500/60'
                            : 'bg-black/40 border-white/20 hover:bg-black/60'
                            }`}
                    >
                        {pushLoading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : isSubscribed ? (
                            <Bell className="w-5 h-5 text-white" />
                        ) : (
                            <BellOff className="w-5 h-5 text-white/60" />
                        )}
                    </motion.button>
                )}
            </div>

            {/* Earnings Pill */}
            <div className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-lg"
                >
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                            Ce mois
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                            <motion.span
                                key={earnings}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-white font-bold text-lg"
                            >
                                {earnings.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                })}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </header>
    )
}
