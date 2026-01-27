'use client'

import { useState } from 'react'
import { RateAgentModal } from './rate-agent-modal'
import { InvoiceButton } from './invoice-button'
import { Star, Mail, Phone, AlertCircle } from 'lucide-react'

interface Agent {
    id: string
    userId: string
    user: {
        name: string | null
        email: string
        phone: string | null
    }
    cartePro: string
}

interface Mission {
    id: string
    title: string
    status: string
    location: string
    startTime: string
    endTime: string
    agent: Agent | null
    hasReviewed: boolean
}

interface CompanyMissionActionsProps {
    mission: Mission
}

export function CompanyMissionActions({ mission }: CompanyMissionActionsProps) {
    const [rateModalOpen, setRateModalOpen] = useState(false)
    const [hasReviewed, setHasReviewed] = useState(mission.hasReviewed)

    const handleRateSuccess = () => {
        setHasReviewed(true)
    }

    return (
        <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                Contacter
            </button>

            {mission.status === 'COMPLETED' ? (
                <>
                    <InvoiceButton
                        mission={{
                            id: mission.id,
                            title: mission.title,
                            startTime: mission.startTime,
                            endTime: mission.endTime,
                            location: mission.location,
                            agent: mission.agent ? {
                                user: { name: mission.agent.user.name },
                                cartePro: mission.agent.cartePro
                            } : null
                        }}
                    />

                    {mission.agent && (
                        hasReviewed ? (
                            <div className="px-4 py-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg flex items-center gap-2 cursor-default">
                                <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                <span>Agent noté</span>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setRateModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                                >
                                    <Star className="w-4 h-4" />
                                    Noter l'agent
                                </button>

                                <RateAgentModal
                                    isOpen={rateModalOpen}
                                    onClose={() => setRateModalOpen(false)}
                                    missionId={mission.id}
                                    agentId={mission.agent.userId}
                                    agentName={mission.agent.user.name || 'Agent'}
                                    onSuccess={handleRateSuccess}
                                />
                            </>
                        )
                    )}
                </>
            ) : (
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors">
                    Annuler
                </button>
            )}
        </div>
    )
}
