'use client'

import { Bell, Plus, ChevronDown, User, Menu } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

interface B2BHeaderProps {
    sidebarCollapsed?: boolean
    onMobileMenuToggle?: () => void
}

export function B2BHeader({ sidebarCollapsed = false, onMobileMenuToggle }: B2BHeaderProps) {
    const { data: session } = useSession()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    // Mock notifications
    const notifications = [
        { id: 1, message: 'Mission #1245 confirmée', time: 'Il y a 5 min', unread: true },
        { id: 2, message: 'Agent Martin disponible', time: 'Il y a 1h', unread: true },
        { id: 3, message: 'Facture #892 générée', time: 'Hier', unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false)
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const companyName = session?.user?.name || 'Mon Entreprise'

    return (
        <header
            className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30 transition-all duration-300 
                left-0 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}
            `}
        >
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
                {/* Left side - Burger + Title */}
                <div className="flex items-center gap-4">
                    {/* Mobile Burger Menu */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* New Mission Button */}
                    <Link
                        href="/company/missions/new"
                        className="flex items-center gap-2 px-3 md:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">Nouvelle Mission</span>
                    </Link>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                                        >
                                            <div className={`w-2 h-2 mt-2 rounded-full ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100">
                                    <Link href="/company/notifications" className="text-sm text-blue-600 hover:underline">
                                        Voir toutes les notifications
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>

                            {/* Company Name */}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                    {companyName}
                                </p>
                                <p className="text-xs text-gray-500">Entreprise</p>
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-medium text-gray-800">{companyName}</p>
                                    <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
                                </div>

                                <Link
                                    href="/company/settings"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Paramètres du compte
                                </Link>
                                <Link
                                    href="/company/invoices"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Mes factures
                                </Link>

                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default B2BHeader
