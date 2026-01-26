'use client'

import { useState, useEffect } from 'react'
import { B2BSidebar } from './b2b-sidebar'
import { B2BHeader } from './b2b-header'
import { useSession } from 'next-auth/react'
import { RealTimeNotifications } from './real-time-notifications'

interface B2BLayoutProps {
    children: React.ReactNode
}

export function B2BLayout({ children }: B2BLayoutProps) {
    const { data: session } = useSession()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed')
        if (saved !== null) {
            setSidebarCollapsed(saved === 'true')
        }
    }, [])

    // Save collapsed state
    const handleToggle = () => {
        const newState = !sidebarCollapsed
        setSidebarCollapsed(newState)
        localStorage.setItem('sidebarCollapsed', String(newState))
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Real-time Notifications */}
            {session?.user?.id && <RealTimeNotifications userId={session.user.id} />}

            {/* Sidebar */}
            <B2BSidebar isCollapsed={sidebarCollapsed} onToggle={handleToggle} />

            {/* Header */}
            <B2BHeader sidebarCollapsed={sidebarCollapsed} />

            {/* Main Content */}
            <main
                className={`pt-16 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'
                    }`}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default B2BLayout
