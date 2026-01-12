'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Log {
    id: string
    newStatus: string
    createdAt: string
    comment?: string
    user?: { name: string; role: string }
}

export function MissionTimeline({ missionId }: { missionId: string }) {
    const [logs, setLogs] = useState<Log[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/missions/${missionId}/logs`)
                if (res.ok) {
                    const json = await res.json()
                    setLogs(json.data)
                }
            } finally {
                setIsLoading(false)
            }
        }
        if (missionId) fetchLogs()
    }, [missionId])

    if (isLoading) return <div className="text-xs text-gray-400">Chargement...</div>
    if (logs.length === 0) return null

    return (
        <div className="flow-root mt-4">
            <h4 className="text-sm font-semibold mb-3">Historique d'activité</h4>
            <ul className="-mb-8">
                {logs.map((log, logIdx) => (
                    <li key={log.id}>
                        <div className="relative pb-8">
                            {logIdx !== logs.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                                        ⏱️
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Statut passé à <span className="font-medium text-gray-900">{log.newStatus}</span>
                                        </p>
                                        {log.user && (
                                            <p className="text-xs text-gray-400">
                                                par {log.user.name} ({log.user.role})
                                            </p>
                                        )}
                                        {log.comment && (
                                            <p className="mt-1 text-sm text-gray-700 italic">"{log.comment}"</p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={log.createdAt}>
                                            {format(new Date(log.createdAt), 'HH:mm dd/MM', { locale: fr })}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
