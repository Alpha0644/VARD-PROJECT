import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserDocuments, checkUserVerificationStatus, DocumentType } from '@/lib/documents'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { CreateMissionForm } from '@/components/mission/create-mission-form'
import { B2BLayout } from '@/components/company/b2b-layout'
import { CompanyDashboardClient } from '@/components/company/dashboard/company-dashboard-client'
import { db } from '@/lib/db'
import {
    TrendingUp,
    Users,
    CalendarCheck,
    Clock,
    AlertTriangle,
    CheckCircle,
    FileText,
    Euro,
    Timer,
    Target
} from 'lucide-react'

export default async function CompanyDashboardPage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const user = session.user
    const documents = await getUserDocuments(user.id)
    const isVerified = await checkUserVerificationStatus(user.id, user.role)

    // Fetch company
    const company = await db.company.findUnique({ where: { userId: user.id } })

    // Fetch active missions with agent data
    const activeMissions = company ? await db.mission.findMany({
        where: {
            companyId: company.id,
            status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] }
        },
        include: { agent: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
    }) : []

    // Stats calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalMissions = company ? await db.mission.count({ where: { companyId: company.id } }) : 0
    const completedMissions = company ? await db.mission.count({ where: { companyId: company.id, status: 'COMPLETED' } }) : 0
    const missionsThisMonth = company ? await db.mission.count({
        where: { companyId: company.id, createdAt: { gte: startOfMonth } }
    }) : 0

    // Calculate estimated hours and cost this month
    const completedThisMonth = company ? await db.mission.findMany({
        where: {
            companyId: company.id,
            status: 'COMPLETED',
            updatedAt: { gte: startOfMonth }
        },
        select: { startTime: true, endTime: true }
    }) : []

    let hoursThisMonth = 0
    for (const m of completedThisMonth) {
        hoursThisMonth += (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60 * 60)
    }
    const costThisMonth = Math.round(hoursThisMonth * 25)

    // Completion rate
    const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0

    // Documents
    const neededDocs = [{ type: DocumentType.SIREN_FIRM, label: 'Kbis / Avis SIRENE' }]
    const docStatus = neededDocs.map(doc => {
        const uploaded = documents.find((d) => d.type === doc.type)
        return { ...doc, uploaded }
    })

    // Prepare missions for client component
    const missionsForMap = activeMissions.map(m => ({
        id: m.id,
        title: m.title,
        location: m.location,
        status: m.status,
        latitude: m.latitude,
        longitude: m.longitude,
        agent: m.agent ? {
            id: m.agent.id,
            user: { name: m.agent.user.name || 'Agent' }
        } : undefined
    }))

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
                        <p className="text-gray-500 mt-1">Bienvenue, {user.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-500">Temps réel activé</span>
                    </div>
                </div>

                {/* Verification Banner */}
                {!isVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Vérification en attente</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Veuillez fournir les documents requis pour créer des missions.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards - Premium Design */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Missions en cours */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Clock className="w-8 h-8 opacity-50" />
                            <span className="text-2xl font-bold">
                                {activeMissions.filter(m => ['IN_PROGRESS', 'EN_ROUTE', 'ARRIVED'].includes(m.status)).length}
                            </span>
                        </div>
                        <p className="text-sm text-blue-100">En cours</p>
                    </div>

                    {/* En attente */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="w-8 h-8 opacity-50" />
                            <span className="text-2xl font-bold">
                                {activeMissions.filter(m => m.status === 'PENDING').length}
                            </span>
                        </div>
                        <p className="text-sm text-amber-100">En attente</p>
                    </div>

                    {/* Ce mois */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <CalendarCheck className="w-8 h-8 opacity-50" />
                            <span className="text-2xl font-bold">{missionsThisMonth}</span>
                        </div>
                        <p className="text-sm text-purple-100">Missions ce mois</p>
                    </div>

                    {/* Dépenses */}
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <Euro className="w-8 h-8 opacity-50" />
                            <span className="text-2xl font-bold">{costThisMonth}€</span>
                        </div>
                        <p className="text-sm text-emerald-100">Dépenses ce mois</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalMissions}</p>
                            <p className="text-sm text-gray-500">Total missions</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Timer className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(hoursThisMonth)}h</p>
                            <p className="text-sm text-gray-500">Heures ce mois</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                            <p className="text-sm text-gray-500">Taux de complétion</p>
                        </div>
                    </div>
                </div>

                {/* Map + Live Feed */}
                {company && (
                    <CompanyDashboardClient
                        missions={missionsForMap}
                        companyId={company.id}
                    />
                )}

                {/* Create Mission Section */}
                {isVerified && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Créer une mission</h2>
                        <CreateMissionForm />
                    </div>
                )}

                {/* Documents Section (collapsed) */}
                <details className="bg-white rounded-xl border border-gray-200">
                    <summary className="px-6 py-4 cursor-pointer flex items-center gap-2 font-medium text-gray-900">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Documents
                        {docStatus.some(d => !d.uploaded) && (
                            <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                Action requise
                            </span>
                        )}
                    </summary>
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                        {docStatus.map((doc, idx) => (
                            <div key={idx} className="mb-4 last:mb-0">
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
                                    <p className="text-sm text-gray-500">
                                        Fichier : {doc.uploaded.name}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </B2BLayout>
    )
}
