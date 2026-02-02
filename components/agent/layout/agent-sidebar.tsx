'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { toast } from 'sonner'
import {
    Map,
    Briefcase,
    User,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Bell,
    BellOff,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AgentSidebarProps {
    isCollapsed?: boolean
    toggleSidebar?: () => void
}

export function AgentSidebar({ isCollapsed = false, toggleSidebar }: AgentSidebarProps) {
    const pathname = usePathname()
    const [missionCount, setMissionCount] = useState(0)
    const { isSubscribed, subscribe, isLoading, isSupported } = usePushNotifications()

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
        <aside
            className={`hidden md:flex fixed left-0 top-0 h-full bg-black border-r border-white/10 flex-col z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo area */}
            <div className={`h-16 flex items-center px-6 border-b border-white/10 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                {!isCollapsed ? (
                    <span className="text-xl font-bold tracking-tighter text-white">
                        VARD <span className="text-blue-500">Agent</span>
                    </span>
                ) : (
                    <span className="text-xl font-bold text-blue-500">V</span>
                )}
            </div>

            {/* Toggle Button */}
            {toggleSidebar && (
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 bg-zinc-800 border border-zinc-700 text-zinc-400 p-1 rounded-full hover:text-white transition-colors z-[60]"
                >
                    {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                </button>
            )}


            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-3 rounded-lg transition-all relative group ${isActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            title={isCollapsed ? item.label : undefined}
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

                            {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Notification Button */}
            {isSupported && (
                <div className="px-3 pb-2">
                    <button
                        onClick={async () => {
                            if (!isSubscribed) {
                                try {
                                    await subscribe()
                                    toast.success('Notifications activées !')
                                } catch (err: any) {
                                    console.error('Notification Error:', err.message)
                                    toast.error('Erreur Notification', {
                                        description: err.message
                                    })
                                }
                            }
                        }}
                        disabled={isSubscribed || isLoading}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-lg transition-colors border ${isSubscribed
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                            }`}
                        title={isSubscribed ? 'Notifications actives' : 'Activer les notifications'}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSubscribed ? (
                            <Bell className="w-5 h-5" />
                        ) : (
                            <BellOff className="w-5 h-5" />
                        )}

                        {!isCollapsed && (
                            <span className="text-xs font-medium">
                                {isLoading ? 'Chargement...' : isSubscribed ? 'Notifs Actives' : 'Activer Notifs'}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Footer / User Info */}
            <div className="p-4 border-t border-white/10">
                <form action="/api/auth/signout" method="POST">
                    <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full transition-colors text-sm font-medium`}>
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && 'Déconnexion'}
                    </button>
                </form>
            </div>
        </aside>
    )
}
