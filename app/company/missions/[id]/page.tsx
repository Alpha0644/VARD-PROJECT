import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { B2BLayout } from '@/components/company/b2b-layout'
import { ArrowLeft, MapPin, Calendar, Clock, User, Shield, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { MissionTimeline } from '@/components/mission/mission-timeline'
import { MissionMapLoader } from '@/components/company/mission/mission-map-loader'
import { CompanyMissionActions } from '@/components/company/mission/company-mission-actions'

// Status badge colors
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
    ACCEPTED: { label: 'Acceptée', color: 'text-blue-700', bg: 'bg-blue-100' },
    EN_ROUTE: { label: 'En route', color: 'text-purple-700', bg: 'bg-purple-100' },
    ARRIVED: { label: 'Sur place', color: 'text-cyan-700', bg: 'bg-cyan-100' },
    IN_PROGRESS: { label: 'En cours', color: 'text-green-700', bg: 'bg-green-100' },
    COMPLETED: { label: 'Terminée', color: 'text-gray-700', bg: 'bg-gray-100' },
    CANCELLED: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-100' },
}

export default async function MissionDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    // 1. Fetch Mission with Security Check (Must belong to company)
    const mission = await db.mission.findUnique({
        where: { id: params.id },
        include: {
            agent: {
                include: { user: true }
            },
            company: true,
            reviews: {
                where: { authorId: session.user.id }
            }
        }
    })

    if (!mission) notFound()

    // 2. Authorization Check
    if (mission.company.userId !== session.user.id) {
        redirect('/company/missions') // Or 403
    }

    const status = STATUS_CONFIG[mission.status] || STATUS_CONFIG.PENDING
    const startDate = new Date(mission.startTime)
    const endDate = new Date(mission.endTime)

    // Calculate duration
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

    return (
        <B2BLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Link */}
                <Link
                    href="/company/missions"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux missions
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{mission.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {mission.location}
                        </p>
                    </div>

                    <CompanyMissionActions
                        mission={{
                            id: mission.id,
                            title: mission.title,
                            status: mission.status,
                            location: mission.location,
                            startTime: mission.startTime.toISOString(),
                            endTime: mission.endTime.toISOString(),
                            agent: mission.agent ? {
                                id: mission.agent.id,
                                userId: mission.agent.userId,
                                user: {
                                    name: mission.agent.user.name,
                                    email: mission.agent.user.email,
                                    phone: mission.agent.user.phone
                                },
                                cartePro: mission.agent.cartePro
                            } : null,
                            hasReviewed: mission.reviews && mission.reviews.length > 0
                        }}
                    />
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details (2 spans) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Agent Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Agent de Sécurité
                            </h2>

                            {mission.agent ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-lg">{mission.agent.user.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">Carte Pro: {mission.agent.cartePro}</p>

                                        <div className="flex gap-3">
                                            {mission.agent.user.phone && (
                                                <a href={`tel:${mission.agent.user.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                                    <Phone className="w-4 h-4" />
                                                    Appeler
                                                </a>
                                            )}
                                            <a href={`mailto:${mission.agent.user.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </a>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200">
                                        VÉRIFIÉ
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-900">En recherche d'agent</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Nous notifions les agents disponibles dans le secteur. Vous serez prévenu dès qu'un agent accepte.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mission Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la mission</h2>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> Date de début
                                    </p>
                                    <p className="font-medium">
                                        {startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500">
                                        à {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" /> Date de fin
                                    </p>
                                    <p className="font-medium">
                                        {endDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500">
                                        à {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-2">Instructions / Description</p>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {mission.description || "Aucune instruction particulière."}
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des événements</h2>
                            <MissionTimeline missionId={mission.id} />
                        </div>
                    </div>

                    {/* Right Column: Map & Summary */}
                    <div className="space-y-6">
                        {/* Map Card */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-80 relative z-0">
                            <MissionMapLoader
                                latitude={mission.latitude}
                                longitude={mission.longitude}
                            />
                        </div>

                        {/* Billing Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Durée prévue</span>
                                    <span className="font-medium">{durationHours.toFixed(1)} heures</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Effectif</span>
                                    <span className="font-medium">1 agent</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Total estimé</span>
                                    <span className="font-bold text-xl text-blue-600">
                                        {(durationHours * 25).toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </B2BLayout>
    )
}
