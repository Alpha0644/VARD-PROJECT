'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Map,
    Briefcase,
    User,
    LogOut,
    Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AgentSidebar() {
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
        <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-white/10 flex-col z-50">
            {/* Logo area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <span className="text-xl font-bold tracking-tighter text-white">
                    VARD <span className="text-blue-500">Agent</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative group ${isActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeAgentNav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="relative">
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />

                                {/* Badge */}
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-black">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Info */}
            <div className="p-4 border-t border-white/10">
                <form action="/api/auth/signout" method="POST">
                    <button className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </form>
            </div>
        </aside>
    )
}
