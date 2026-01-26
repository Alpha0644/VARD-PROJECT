import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserDocuments, checkUserVerificationStatus, DocumentType } from '@/lib/documents'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { CreateMissionForm } from '@/components/mission/create-mission-form'
import { B2BLayout } from '@/components/company/b2b-layout'
import { db } from '@/lib/db'
import {
    TrendingUp,
    Users,
    CalendarCheck,
    Clock,
    AlertTriangle,
    CheckCircle,
    FileText
} from 'lucide-react'

export default async function CompanyDashboardPage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const user = session.user
    const documents = await getUserDocuments(user.id)
    const isVerified = await checkUserVerificationStatus(user.id, user.role)

    // Fetch company's active missions
    const company = await db.company.findUnique({ where: { userId: user.id } })
    const activeMissions = company ? await db.mission.findMany({
        where: {
            companyId: company.id,
            status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
        },
        include: { agent: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
    }) : []

    // Stats
    const totalMissions = company ? await db.mission.count({ where: { companyId: company.id } }) : 0
    const completedMissions = company ? await db.mission.count({ where: { companyId: company.id, status: 'COMPLETED' } }) : 0

    // Documents nécessaires pour Company
    const neededDocs = [
        { type: DocumentType.SIREN_FIRM, label: 'Kbis / Avis SIRENE' }
    ]

    const docStatus = neededDocs.map(doc => {
        const uploaded = documents.find((d) => d.type === doc.type)
        return { ...doc, uploaded }
    })

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
                    <p className="text-gray-500 mt-1">Bienvenue, {user.name}</p>
                </div>

                {/* Verification Status Banner */}
                {!isVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Vérification en attente</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Votre compte n'est pas encore vérifié. Veuillez fournir les documents requis pour créer des missions.
                            </p>
                        </div>
                    </div>
                )}

                {isVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-green-800">Compte vérifié</p>
                            <p className="text-sm text-green-700 mt-0.5">
                                Vous pouvez créer des missions et accéder à toutes les fonctionnalités.
                            </p>
                        </div>
                    </div>
                )}

                {/* Urgent Stats Cards - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Agents sur site */}
                    <div className="relative bg-white rounded-xl shadow-sm p-6 overflow-hidden">
                        <Users className="absolute top-4 right-4 w-10 h-10 text-green-500/20" />
                        <p className="text-sm font-medium text-gray-500 mb-1">Missions en cours</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {activeMissions.filter(m => m.status === 'IN_PROGRESS').length}
                        </p>
                        <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {activeMissions.filter(m => m.agent).length} agent{activeMissions.filter(m => m.agent).length !== 1 ? 's' : ''} assigné{activeMissions.filter(m => m.agent).length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Missions en attente */}
                    <div className="relative bg-white rounded-xl shadow-sm p-6 overflow-hidden">
                        <Clock className="absolute top-4 right-4 w-10 h-10 text-orange-500/20" />
                        <p className="text-sm font-medium text-gray-500 mb-1">Missions en attente</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {activeMissions.filter(m => m.status === 'PENDING').length}
                        </p>
                        {activeMissions.filter(m => m.status === 'PENDING').length > 0 ? (
                            <p className="text-sm font-medium text-orange-500 mt-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                Recherche en cours...
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-gray-400 mt-2">
                                Aucune mission en attente
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Missions actives</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{activeMissions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Missions terminées</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{completedMissions}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CalendarCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total missions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totalMissions}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Agents favoris</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Missions - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Missions en cours</h2>
                            <Link
                                href="/company/missions"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Voir tout
                            </Link>
                        </div>

                        {activeMissions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Aucune mission en cours</p>
                                <p className="text-sm mt-1">Créez votre première mission pour commencer</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeMissions.slice(0, 5).map(mission => (
                                    <div
                                        key={mission.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${mission.status === 'IN_PROGRESS' ? 'bg-green-500 animate-pulse' :
                                                mission.status === 'ARRIVED' ? 'bg-blue-500' :
                                                    mission.status === 'EN_ROUTE' ? 'bg-amber-500' :
                                                        'bg-gray-400'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-gray-900">{mission.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {mission.agent?.user.name || 'En attente d\'agent'} • {mission.status}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/company/missions/${mission.id}`}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Suivre
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Documents Section - 1 column */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                        </div>

                        <div className="space-y-4">
                            {docStatus.map((doc, idx) => (
                                <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-800">{doc.label}</span>
                                        {doc.uploaded && (
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${doc.uploaded.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                                doc.uploaded.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                {doc.uploaded.status === 'VERIFIED' ? 'Vérifié' :
                                                    doc.uploaded.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        )}
                                    </div>

                                    {!doc.uploaded || doc.uploaded.status === 'REJECTED' ? (
                                        <DocumentUpload type={doc.type} label={doc.label} />
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            <p>Fichier : {doc.uploaded.name}</p>
                                            <p>Date : {new Date(doc.uploaded.createdAt).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {isVerified && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Créer une mission</h2>
                        <p className="text-gray-500 mb-6">Postez une mission pour trouver des agents disponibles immédiatement.</p>
                        <CreateMissionForm />
                    </div>
                )}
            </div>
        </B2BLayout>
    )
}
