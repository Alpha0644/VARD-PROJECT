import { AgentMap } from '@/components/agent/map/agent-map'

export default function AgentDashboardPage() {
    return (
        <div className="relative w-full h-full">
            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <AgentMap />
            </div>

            {/* Floating Status Toggle (Bottom Center) - Placeholder */}
            <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center">
                    <button className="w-20 h-20 rounded-full bg-vard-blue text-white font-bold text-xl shadow-lg ring-4 ring-vard-blue/30 animate-pulse">
                        GO
                    </button>
                    <p className="mt-4 text-gray-500 font-medium">Vous êtes hors ligne</p>
                </div>
            </div>
        </div>
    )
}

