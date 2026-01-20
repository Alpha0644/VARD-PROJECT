import { AgentTopBar } from '@/components/agent/layout/top-bar'
import { AgentBottomNav } from '@/components/agent/layout/bottom-nav'

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Top Bar Overlay */}
            <AgentTopBar />

            {/* Main Content Area - Full Screen (Map usually) */}
            <main className="h-[100dvh] w-full relative">
                {children}
            </main>

            {/* Bottom Navigation */}
            <AgentBottomNav />
        </div>
    )
}
