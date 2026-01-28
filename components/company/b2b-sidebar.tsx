'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarClock,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    History
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarProps {
    isCollapsed?: boolean
    onToggle?: () => void
    onMobileClose?: () => void
}

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    { href: '/company/dashboard', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/company/missions', label: 'Missions', icon: <CalendarClock className="w-5 h-5" /> },
    { href: '/company/missions?filter=completed', label: 'Historique', icon: <History className="w-5 h-5" /> },
    { href: '/company/agents', label: 'Mes Agents', icon: <Users className="w-5 h-5" /> },
    { href: '/company/invoices', label: 'Factures', icon: <FileText className="w-5 h-5" /> },
    { href: '/company/settings', label: 'Paramètres', icon: <Settings className="w-5 h-5" /> },
]

export function B2BSidebar({ isCollapsed = false, onToggle, onMobileClose }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed ? 'px-4 justify-center' : 'px-6'}`}>
                {isCollapsed ? (
                    <span className="text-2xl font-bold text-white">V</span>
                ) : (
                    <Link href="/company/dashboard" className="text-2xl font-bold text-white tracking-tight">
                        VARD <span className="text-blue-500">Pro</span>
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative ${isActive
                                        ? 'bg-slate-800/80 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <span className={isActive ? 'text-blue-400' : ''}>
                                        {item.icon}
                                    </span>

                                    {!isCollapsed && (
                                        <span className="font-medium truncate">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Réduire</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}

export default B2BSidebar
