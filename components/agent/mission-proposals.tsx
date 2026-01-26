'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Euro, ArrowRight, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PendingMission {
    id: string
    title: string
    description: string
    location: string
    startTime: string
    endTime: string
    company: {
        companyName: string
    }
}

import { pusherClient } from '@/lib/pusher-client'

export function MissionProposals() {
    const [missions, setMissions] = useState<PendingMission[]>([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Fetch initial missions
        fetch('/api/missions/available')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMissions(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))

        // Real-time updates
        const channel = pusherClient.subscribe('public-missions')
        channel.bind('mission:created', (newMission: PendingMission) => {
            console.log('🔔 Live Feed Event Received:', newMission)
            setMissions(prev => [newMission, ...prev])
            // Optional: Play a sound or show toast
        })

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('✅ Subscribed to public-missions channel')
        })

        channel.bind('pusher:subscription_error', (status: any) => {
            console.error('❌ Subscription error:', status)
        })

        return () => {
            pusherClient.unsubscribe('public-missions')
        }
    }, [])

    const handleAccept = async (missionId: string) => {
        setAcceptingId(missionId)
        try {
            const res = await fetch(`/api/missions/${missionId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            })

            if (res.ok) {
                // Refresh to trigger switch to ActiveMission view in parent
                router.refresh()
            } else {
                alert('Erreur lors de l\'acceptation')
            }
        } catch (error) {
            console.error('Accept error:', error)
            alert('Erreur réseau')
        } finally {
            setAcceptingId(null)
        }
    }

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (missions.length === 0) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-50 z-20">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune mission disponible</h2>
                <p className="text-gray-500">
                    Restez connecté, nous vous notifierons dès qu&apos;une mission sera disponible dans votre secteur.
                </p>
            </div>
        )
    }

    return (
        <div className="absolute inset-x-0 bottom-0 top-16 bg-gray-50 z-20 overflow-y-auto p-4 md:p-6 pb-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Missions disponibles ({missions.length})</h2>

            <div className="space-y-4 max-w-2xl mx-auto">
                {missions.map((mission) => {
                    const duration = (new Date(mission.endTime).getTime() - new Date(mission.startTime).getTime()) / (1000 * 60 * 60)
                    const estPrice = Math.round(duration * 25) // Basic estimation

                    return (
                        <div key={mission.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{mission.title}</h3>
                                        <p className="text-sm text-gray-500">{mission.company.companyName}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                        ~{estPrice}€
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{mission.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {new Date(mission.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} •
                                            {new Date(mission.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(mission.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAccept(mission.id)}
                                    disabled={acceptingId === mission.id}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {acceptingId === mission.id ? (
                                        'Acceptation...'
                                    ) : (
                                        <>
                                            Accepter la mission <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
