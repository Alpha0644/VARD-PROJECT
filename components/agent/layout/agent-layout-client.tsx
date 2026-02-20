'use client'
import { useEffect } from 'react'

import { AgentTopBar } from '@/components/agent/layout/top-bar'
import { AgentBottomNav } from '@/components/agent/layout/bottom-nav'
import { AgentSidebar } from '@/components/agent/layout/agent-sidebar'
import { SidebarProvider, useSidebar } from '@/components/agent/context/sidebar-context'
import { AgentRealTimeNotifications } from '@/components/agent/dashboard/agent-real-time-notifications'
import { cn } from '@/lib/utils'

interface AgentLayoutClientProps {
    children: React.ReactNode
    userId?: string
}

function AgentLayoutContent({ children, userId }: AgentLayoutClientProps) {
    const { isCollapsed, toggleSidebar } = useSidebar()

    // Debug session cookie
    useEffect(() => {
        console.log('🍪 Cookies on load:', document.cookie)
        const hasSession = document.cookie.includes('next-auth.session-token')
        console.log('✅ Session token present:', hasSession)
    }, [])

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden flex">
            {/* Global Real-Time Notifications */}
            {userId && <AgentRealTimeNotifications userId={userId} />}

            {/* Desktop Sidebar (Left) - Hidden on Mobile */}
            <AgentSidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />

            <div
                className={cn(
                    "flex-1 flex flex-col h-[100dvh] w-full relative transition-all duration-300",
                    isCollapsed ? "md:pl-20" : "md:pl-64"
                )}
            >
                {/* Top Bar Overlay - Mobile Only (or adjust if needed for desktop) */}
                <div className="md:hidden">
                    <AgentTopBar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 w-full relative overflow-y-auto md:overflow-hidden">
                    {children}
                </main>

                {/* Bottom Navigation - Hidden on Desktop */}
                <div className="md:hidden">
                    <AgentBottomNav />
                </div>
            </div>
        </div>
    )
}

export function AgentLayoutClient({ children, userId }: AgentLayoutClientProps) {
    return (
        <SidebarProvider>
            <AgentLayoutContent userId={userId}>{children}</AgentLayoutContent>
        </SidebarProvider>
    )
}
