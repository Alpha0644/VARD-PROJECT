'use client'

import { TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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

    const earnings = stats?.month.estimatedEarnings ?? 0
    const userImage = stats?.user?.image
    const userName = stats?.user?.name

    // Hidden on mobile (md:flex), visible on desktop only
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] hidden md:flex justify-between items-center pointer-events-none">
            {/* Left: Avatar (desktop only) */}
            <div className="pointer-events-auto">
                <Link href="/agent/profile">
                    <motion.div
                        whileTap={{ scale: 0.93 }}
                        className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-lg overflow-hidden"
                    >
                        {userImage ? (
                            <img src={userImage} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-sm font-semibold">
                                {userName?.charAt(0)?.toUpperCase() || 'V'}
                            </span>
                        )}
                    </motion.div>
                </Link>
            </div>

            {/* Right: Earnings Pill (desktop only) */}
            <div className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-full px-3.5 py-2 flex items-center gap-2.5 shadow-lg"
                >
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        ) : (
                            <motion.span
                                key={earnings}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-white font-semibold text-sm"
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
