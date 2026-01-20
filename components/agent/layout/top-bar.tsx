import { User } from 'lucide-react'

export function AgentTopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
            {/* Profile - Pointer events auto to allow clicking */}
            <div className="pointer-events-auto">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Earnings Pill */}
            <div className="pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Gain</span>
                    <span className="text-white font-bold">0,00 €</span>
                </div>
            </div>
        </header>
    )
}
