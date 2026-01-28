'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { History } from 'lucide-react'
import { MissionCardSkeleton } from '@/components/ui/skeletons'
import { EmptyState } from '@/components/ui/empty-state'

interface Mission {
    id: string
    title: string
    status: string
    startTime: string
    endTime: string
    location: string
    company?: { companyName: string }
    agent?: { cartePro: string }
}

interface MissionHistoryListProps {
    role: 'AGENT' | 'COMPANY'
}

export function MissionHistoryList({ role }: MissionHistoryListProps) {
    const [missions, setMissions] = useState<Mission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/missions/history?limit=20')
                if (!res.ok) throw new Error('Erreur chargement')
                const json = await res.json()
                setMissions(json.data)
            } catch (err) {
                setError('Impossible de charger l\'historique')
            } finally {
                setIsLoading(false)
            }
        }

        fetchHistory()
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <MissionCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (error) return <div className="text-red-500 text-center py-8">{error}</div>

    if (missions.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="Aucun historique"
                description="Vous n'avez pas encore de missions terminées dans votre historique."
            />
        )
    }

    return (
        <div className="space-y-4">
            {missions.map((mission) => (
                <div key={mission.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg">{mission.title}</h3>
                            <p className="text-sm text-gray-500">
                                {format(new Date(mission.startTime), 'PPP à HH:mm', { locale: fr })}
                            </p>
                        </div>
                        <StatusBadge status={mission.status} />
                    </div>

                    <div className="text-sm text-gray-700 mt-2">
                        <p>📍 {mission.location}</p>
                        {role === 'AGENT' && mission.company && (
                            <p className="mt-1">🏢 {mission.company.companyName}</p>
                        )}
                        {role === 'COMPANY' && mission.agent && (
                            <p className="mt-1">👮 Agent ID: {mission.agent.cartePro}</p>
                        )}
                    </div>

                    {/* Placeholder for Details/Logs Link */}
                    <div className="mt-3 pt-3 border-t text-right">
                        <button className="text-blue-600 text-sm font-medium hover:underline">
                            Voir le rapport
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
        NO_SHOW: 'bg-yellow-100 text-yellow-800',
        PENDING: 'bg-gray-100 text-gray-800' // Should not happen in history but safe fallback
    }

    const labels: Record<string, string> = {
        COMPLETED: 'Terminée',
        CANCELLED: 'Annulée',
        NO_SHOW: 'Absent',
        PENDING: 'En attente'
    }

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    )
}
