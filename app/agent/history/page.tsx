import { MissionHistoryList } from '@/components/mission/mission-history-list'
import Link from 'next/link'

export default function AgentHistoryPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Mes Missions Terminées</h1>
                <Link href="/agent/dashboard" className="text-blue-600 hover:underline text-sm">
                    ← Retour au tableau de bord
                </Link>
            </div>

            <MissionHistoryList role="AGENT" />
        </div>
    )
}
