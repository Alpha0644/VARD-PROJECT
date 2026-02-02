'use client'

import { useState } from 'react'
import { AgentTopBar } from '@/components/agent/layout/top-bar'
import { AgentBottomNav } from '@/components/agent/layout/bottom-nav'
import { AgentSidebar } from '@/components/agent/layout/agent-sidebar'
import { cn } from '@/lib/utils'

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden flex">
            {/* Desktop Sidebar (Left) - Hidden on Mobile */}
            <AgentSidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
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

