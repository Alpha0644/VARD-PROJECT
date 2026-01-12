import { MissionHistoryList } from '@/components/mission/mission-history-list'
import Link from 'next/link'

export default function CompanyHistoryPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Archives des Missions</h1>
                <Link href="/company/dashboard" className="text-blue-600 hover:underline text-sm">
                    ← Retour au tableau de bord
                </Link>
            </div>

            <MissionHistoryList role="COMPANY" />
        </div>
    )
}
