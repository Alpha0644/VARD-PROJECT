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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed')
        if (saved !== null) {
            setSidebarCollapsed(saved === 'true')
        }
    }, [])

    // Close mobile menu on route change or resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
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

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile, visible on lg+ */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <B2BSidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={handleToggle}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
            </div>

            {/* Header */}
            <B2BHeader
                sidebarCollapsed={sidebarCollapsed}
                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            />

            {/* Main Content - Full width on mobile, offset on lg+ */}
            <main
                className={`pt-16 min-h-screen transition-all duration-300 pl-0 
                    ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
                `}
            >
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default B2BLayout

