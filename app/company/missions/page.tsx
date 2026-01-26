import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { db } from '@/lib/db'
import { CalendarClock, Plus, Filter, Clock, MapPin, User, MoreVertical } from 'lucide-react'
import Link from 'next/link'

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

export default async function CompanyMissionsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    // Fetch company and missions
    const company = await db.company.findUnique({
        where: { userId: session.user.id }
    })

    const missions = company ? await db.mission.findMany({
        where: { companyId: company.id },
        include: {
            agent: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    }) : []

    // Group missions by status
    const activeMissions = missions.filter(m =>
        ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(m.status)
    )
    const completedMissions = missions.filter(m => m.status === 'COMPLETED')
    const cancelledMissions = missions.filter(m => m.status === 'CANCELLED')

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Planning Missions</h1>
                        <p className="text-gray-500 mt-1">
                            {missions.length} mission{missions.length !== 1 ? 's' : ''} au total
                        </p>
                    </div>
                    <Link
                        href="/company/missions/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Mission
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Actives</p>
                        <p className="text-2xl font-bold text-gray-900">{activeMissions.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Terminées</p>
                        <p className="text-2xl font-bold text-green-600">{completedMissions.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Annulées</p>
                        <p className="text-2xl font-bold text-red-600">{cancelledMissions.length}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">Toutes</button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">En cours</button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Planifiées</button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Terminées</button>
                    </div>
                </div>

                {/* Mission List */}
                {missions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <CalendarClock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune mission</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Vous n&apos;avez pas encore créé de mission. Commencez par créer votre première mission de sécurité.
                        </p>
                        <Link
                            href="/company/missions/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Créer une mission
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {missions.map((mission) => {
                            const status = STATUS_CONFIG[mission.status] || STATUS_CONFIG.PENDING
                            const startDate = new Date(mission.startTime)
                            const endDate = new Date(mission.endTime)

                            return (
                                <div
                                    key={mission.id}
                                    className="p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Title & Status */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{mission.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                        {' '}
                                                        {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        {mission.agent?.user.name || 'En attente d\'agent'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/company/missions/${mission.id}`}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                            >
                                                Voir détails
                                            </Link>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
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
