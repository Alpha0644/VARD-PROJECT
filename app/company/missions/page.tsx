import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { db } from '@/lib/db'
import { CalendarClock, Plus, Filter, Clock, MapPin, User, MoreVertical, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { CompanyMissionActions } from '@/components/company/mission/company-mission-actions'

// Status badge colors and labels
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
    ACCEPTED: { label: 'Acceptée', color: 'text-blue-700', bg: 'bg-blue-100' },
    EN_ROUTE: { label: 'En route', color: 'text-purple-700', bg: 'bg-purple-100' },
    ARRIVED: { label: 'Sur place', color: 'text-cyan-700', bg: 'bg-cyan-100' },
    IN_PROGRESS: { label: 'En cours', color: 'text-green-700', bg: 'bg-green-100' },
    COMPLETED: { label: 'Terminée', color: 'text-gray-700', bg: 'bg-gray-100' },
    CANCELLED: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-100' },
}

export default async function CompanyMissionsPage({
    searchParams,
}: {
    searchParams: { filter?: string }
}) {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const filter = searchParams.filter || 'all'

    // Fetch company and missions
    const company = await db.company.findUnique({
        where: { userId: session.user.id }
    })

    const missions = company ? await db.mission.findMany({
        where: { companyId: company.id },
        include: {
            agent: {
                include: { user: true }
            },
            reviews: {
                where: { authorId: session.user.id },
                select: { id: true, rating: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    }) : []

    // Helper for counts
    const counts = {
        active: missions.filter(m => ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(m.status)).length,
        completed: missions.filter(m => m.status === 'COMPLETED').length,
        cancelled: missions.filter(m => m.status === 'CANCELLED').length,
        all: missions.length
    }

    // Filter logic
    let displayedMissions = missions
    if (filter === 'active') {
        displayedMissions = missions.filter(m => ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(m.status))
    } else if (filter === 'completed') {
        displayedMissions = missions.filter(m => m.status === 'COMPLETED')
    } else if (filter === 'cancelled') {
        displayedMissions = missions.filter(m => m.status === 'CANCELLED')
    }

    const FilterButton = ({ value, label, count }: { value: string, label: string, count: number }) => (
        <Link
            href={`/company/missions?filter=${value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === value
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
        >
            {label} <span className="ml-1 opacity-60">({count})</span>
        </Link>
    )

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Planning Missions</h1>
                        <p className="text-gray-500 mt-1">
                            Gérez vos demandes et consultez l'historique.
                        </p>
                    </div>
                    <Link
                        href="/company/missions/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Mission
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2">
                    <FilterButton value="all" label="Toutes" count={counts.all} />
                    <FilterButton value="active" label="En cours" count={counts.active} />
                    <FilterButton value="completed" label="Terminées" count={counts.completed} />
                    <FilterButton value="cancelled" label="Annulées" count={counts.cancelled} />
                </div>

                {/* Mission List */}
                {displayedMissions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <CalendarClock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune mission trouvée</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {filter === 'all'
                                ? "Vous n'avez pas encore créé de mission."
                                : "Aucune mission ne correspond à ce filtre."}
                        </p>
                        {filter === 'all' && (
                            <Link
                                href="/company/missions/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Créer une mission
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                        {displayedMissions.map((mission) => {
                            const status = STATUS_CONFIG[mission.status] || STATUS_CONFIG.PENDING
                            const startDate = new Date(mission.startTime)
                            const endDate = new Date(mission.endTime)
                            const isRated = mission.reviews && mission.reviews.length > 0

                            return (
                                <div
                                    key={mission.id}
                                    className="p-5 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Title & Status */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {mission.title}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{mission.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        {' • '}
                                                        {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {mission.agent?.user.name || 'En attente d\'agent'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {mission.status === 'COMPLETED' && mission.agent && (
                                                <div className="mr-2">
                                                    {isRated ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium border border-yellow-200">
                                                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                            Noté
                                                        </span>
                                                    ) : (
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
                                                                    cartePro: mission.agent.cartePro,
                                                                    user: {
                                                                        name: mission.agent.user.name,
                                                                        email: mission.agent.user.email,
                                                                        phone: mission.agent.user.phone
                                                                    }
                                                                } : null,
                                                                hasReviewed: isRated
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <Link
                                                href={`/company/missions/${mission.id}`}
                                                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 text-sm rounded-lg transition-colors font-medium"
                                            >
                                                Détails
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </B2BLayout>
    )
}
