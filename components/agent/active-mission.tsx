'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { MissionWithCompany } from '@/lib/types/mission'
import { LiveTrackingToggle } from './live-tracking-toggle'

interface ActiveMissionProps {
    mission: MissionWithCompany
}

const STATUS_FLOW = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED']

export function ActiveMission({ mission }: ActiveMissionProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(mission.status)
    const router = useRouter()

    const handleStatusUpdate = async (newStatus: string) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/missions/${mission.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    // Optional: Send current location if we had it
                })
            })

            if (!res.ok) throw new Error('Update failed')

            setCurrentStatus(newStatus)
            router.refresh()
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Erreur lors de la mise à jour du statut')
        } finally {
            setIsLoading(false)
        }
    }

    const getNextStatus = (status: string) => {
        const index = STATUS_FLOW.indexOf(status)
        if (index === -1 || index === STATUS_FLOW.length - 1) return null
        return STATUS_FLOW[index + 1]
    }

    const nextStatus = getNextStatus(currentStatus)
    const nextStatusLabels: Record<string, string> = {
        'EN_ROUTE': '🚗 Je suis en route',
        'ARRIVED': '📍 Je suis sur place',
        'IN_PROGRESS': '▶️ Commencer la mission',
        'COMPLETED': '✅ Terminer la mission'
    }

    if (currentStatus === 'COMPLETED') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">Mission Terminée ! 🎉</h3>
                <p className="text-green-600">Bravo pour votre travail. Cette mission est archivée.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4">
                <div className="flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">Mission en Cours</h3>
                    <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-mono">
                        {currentStatus}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{mission.title}</h2>
                    <p className="text-gray-500">{mission.company.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-500 mb-1">📍 Lieu</p>
                        <p className="font-medium">{mission.location}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-500 mb-1">📅 Début</p>
                        <p className="font-medium">
                            {new Date(mission.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {mission.description && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-blue-800 text-sm">{mission.description}</p>
                    </div>
                )}

                {/* GPS Live Tracking */}
                {(currentStatus === 'EN_ROUTE' || currentStatus === 'ARRIVED' || currentStatus === 'IN_PROGRESS') && (
                    <LiveTrackingToggle missionId={mission.id} />
                )}

                {/* Progress Bar */}
                <div className="relative pt-4 pb-2">
                    <div className="flex justify-between mb-2">
                        {STATUS_FLOW.map((s, idx) => {
                            const isPast = STATUS_FLOW.indexOf(currentStatus) >= idx
                            return (
                                <div key={s} className="flex flex-col items-center flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isPast ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-[10px] mt-1 ${isPast ? 'text-blue-700 font-medium' : 'text-gray-300'}`}>
                                        {s.replace('_', ' ')}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="relative h-1 bg-gray-200 rounded mt-2 mx-4 z-0">
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-600 rounded transition-all duration-500"
                            style={{ width: `${(STATUS_FLOW.indexOf(currentStatus) / (STATUS_FLOW.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Action Button */}
                {nextStatus && (
                    <button
                        onClick={() => handleStatusUpdate(nextStatus)}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg active:transform active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="animate-spin">🔄</span>
                        ) : (
                            <span>{nextStatusLabels[nextStatus] || nextStatus}</span>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
