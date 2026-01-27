'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Briefcase, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AgentBottomNav() {
    const pathname = usePathname()
    const [missionCount, setMissionCount] = useState(0)

    useEffect(() => {
        // Fetch available missions count
        fetch('/api/agent/stats')
            .then(res => res.json())
            .then(data => {
                if (data.current?.availableMissions) {
                    setMissionCount(data.current.availableMissions)
                }
            })
            .catch(console.error)
    }, [])

    const navItems = [
        {
            label: 'Carte',
            icon: Map,
            href: '/agent/dashboard',
        },
        {
            label: 'Missions',
            icon: Briefcase,
            href: '/agent/missions',
            badge: missionCount > 0 ? missionCount : undefined,
        },
        {
            label: 'Profil',
            icon: User,
            href: '/agent/profile',
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 pb-safe-area">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />

                                {/* Badge */}
                                {item.badge && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                                    >
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </motion.span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>

                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
