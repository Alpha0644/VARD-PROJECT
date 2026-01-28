'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Briefcase, Clock, TrendingUp, CheckCircle, Calendar, MapPin, FileDown, ArrowRight, X } from 'lucide-react'

interface Stats {
    month: {
        completedCount: number
        totalHours: number
        estimatedEarnings: number
    }
    current: {
        activeMissions: number
        availableMissions: number
    }
    allTime: {
        totalCompleted: number
    }
}

interface Mission {
    id: string
    title: string
    location: string
    status: string
    startTime: string
    endTime: string
    company: {
        companyName: string
        userId: string
    }
    reviews?: { id: string, rating: number }[]
}

import { RateCompanyModal } from '@/components/agent/mission/rate-company-modal'
import { Star } from 'lucide-react'

export default function AgentMissionsPage() {
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [missions, setMissions] = useState<Mission[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'available' | 'history'>('available')
    const [acceptingId, setAcceptingId] = useState<string | null>(null)

    // Rating Modal State
    const [ratingModalOpen, setRatingModalOpen] = useState(false)
    const [selectedMissionToRate, setSelectedMissionToRate] = useState<Mission | null>(null)

    const handleOpenRateModal = (mission: Mission) => {
        setSelectedMissionToRate(mission)
        setRatingModalOpen(true)
    }

    const handleRatingSuccess = () => {
        // Refresh missions to update UI
        setActiveTab('history') // Trigger re-fetch
        // Or optimally update local state:
        if (selectedMissionToRate) {
            setMissions(prev => prev.map(m =>
                m.id === selectedMissionToRate.id
                    ? { ...m, reviews: [{ id: 'temp', rating: 5 }] } // Mark as reviewed
                    : m
            ))
        }
    }

    const handleAcceptMission = async (missionId: string) => {
        setAcceptingId(missionId)
        try {
            const res = await fetch(`/api/missions/${missionId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            })

            if (res.ok) {
                if (navigator.vibrate) navigator.vibrate([50, 50, 100])
                // Remove from list immediately
                setMissions(prev => prev.filter(m => m.id !== missionId))
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Erreur lors de l\'acceptation')
            }
        } catch (error) {
            console.error('Accept error:', error)
            alert('Erreur réseau')
        } finally {
            setAcceptingId(null)
        }
    }

    const handleRejectMission = (missionId: string) => {
        // Remove from list optimistically
        setMissions(prev => prev.filter(m => m.id !== missionId))
        if (navigator.vibrate) navigator.vibrate(50)

        // Persist to server
        fetch('/api/agent/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missionId })
        }).catch(console.error)
    }

    useEffect(() => {
        // Fetch stats
        fetch('/api/agent/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data)
            })
            .catch(console.error)

        // Fetch available or history based on tab
        const endpoint = activeTab === 'available'
            ? '/api/missions/available'
            : '/api/missions/history?role=agent'

        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMissions(data)
                else if (data.missions) setMissions(data.missions)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [activeTab])

    const statCards = [
        {
            label: 'Ce mois',
            value: stats?.month.completedCount ?? 0,
            suffix: 'missions',
            icon: Briefcase,
            color: 'blue',
        },
        {
            label: 'Heures',
            value: stats?.month.totalHours ?? 0,
            suffix: 'h',
            icon: Clock,
            color: 'purple',
        },
        {
            label: 'Revenus',
            value: stats?.month.estimatedEarnings ?? 0,
            suffix: '€',
            icon: TrendingUp,
            color: 'green',
        },
        {
            label: 'Total',
            value: stats?.allTime.totalCompleted ?? 0,
            suffix: 'missions',
            icon: CheckCircle,
            color: 'orange',
        },
    ]

    const colorStyles: Record<string, { bg: string, icon: string }> = {
        blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
        purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
        green: { bg: 'bg-green-100', icon: 'text-green-600' },
        orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
    }

    const statusLabels: Record<string, { label: string, bg: string, text: string }> = {
        'PENDING': { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'ACCEPTED': { label: 'Acceptée', bg: 'bg-blue-100', text: 'text-blue-700' },
        'EN_ROUTE': { label: 'En route', bg: 'bg-indigo-100', text: 'text-indigo-700' },
        'ARRIVED': { label: 'Sur place', bg: 'bg-purple-100', text: 'text-purple-700' },
        'IN_PROGRESS': { label: 'En cours', bg: 'bg-cyan-100', text: 'text-cyan-700' },
        'COMPLETED': { label: 'Terminée', bg: 'bg-green-100', text: 'text-green-700' },
        'CANCELLED': { label: 'Annulée', bg: 'bg-red-100', text: 'text-red-700' },
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-16 px-4 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Mes Missions</h1>
            </div>

            {/* Stats Grid */}
            <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                    {statCards.map((stat, idx) => {
                        const style = colorStyles[stat.color]
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className={`w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center mb-3`}>
                                    <Icon className={`w-5 h-5 ${style.icon}`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                    <span className="text-sm font-normal text-gray-500 ml-1">{stat.suffix}</span>
                                </p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
                <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'available'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Disponibles ({stats?.current.availableMissions ?? 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Historique
                    </button>
                </div>
            </div>

            {/* Export Button (only in history tab) */}
            {activeTab === 'history' && (
                <div className="px-4 mb-4">
                    <a
                        href="/api/agent/export"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                    >
                        <FileDown className="w-4 h-4" />
                        Exporter le récapitulatif (PDF)
                    </a>
                </div>
            )}

            {/* Missions List */}
            <div className="px-4 space-y-3">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))
                ) : missions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                            {activeTab === 'available'
                                ? 'Aucune mission disponible'
                                : 'Aucun historique'
                            }
                        </p>
                    </div>
                ) : (
                    missions.map((mission, idx) => {
                        const statusStyle = statusLabels[mission.status] || statusLabels['PENDING']
                        return (
                            <motion.div
                                key={mission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{mission.title}</h3>
                                        <p className="text-xs text-gray-500">{mission.company.companyName}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                        {statusStyle.label}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{mission.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(mission.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons for PENDING Missions */}
                                {mission.status === 'PENDING' && activeTab === 'available' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleRejectMission(mission.id)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" />
                                            Refuser
                                        </button>
                                        <button
                                            onClick={() => handleAcceptMission(mission.id)}
                                            disabled={acceptingId === mission.id}
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {acceptingId === mission.id ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Accepter</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Action Buttons for Completed Missions */}
                                {mission.status === 'COMPLETED' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                        {mission.reviews && mission.reviews.length > 0 ? (
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                                                Notée
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenRateModal(mission)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Star className="w-3 h-3" />
                                                Noter l'entreprise
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })
                )}
            </div>


            {/* Rating Modal */}
            {
                selectedMissionToRate && (
                    <RateCompanyModal
                        isOpen={ratingModalOpen}
                        onClose={() => setRatingModalOpen(false)}
                        missionId={selectedMissionToRate.id}
                        companyId={selectedMissionToRate.company.userId}
                        companyName={selectedMissionToRate.company.companyName}
                        onSuccess={handleRatingSuccess}
                    />
                )
            }
        </div >
    )
}

