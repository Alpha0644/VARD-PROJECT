import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserDocuments, checkUserVerificationStatus, DocumentType } from '@/lib/documents'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { LocationSimulator } from '@/components/agent/location-simulator'
import { MissionProposals } from '@/components/agent/mission-proposals'
import { ActiveMission } from '@/components/agent/active-mission'
import { LogoutButton } from '@/components/auth/logout-button'
import { db } from '@/lib/db'
import { MissionNotifications } from '@/components/mission/mission-notifications'

export default async function AgentDashboardPage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    const user = session.user
    const documents = await getUserDocuments(user.id)
    const isVerified = await checkUserVerificationStatus(user.id, user.role)

    // Documents nécessaires pour Agent
    const neededDocs = [
        { type: DocumentType.CNAPS, label: 'Carte Professionnelle (CNAPS)' },
        { type: DocumentType.ID_CARD, label: "Carte d'Identité / Passeport" }
    ]

    const docStatus = neededDocs.map(doc => {
        const uploaded = documents.find((d) => d.type === doc.type)
        return { ...doc, uploaded }
    })

    // Fetch Active Mission
    let activeMission = null
    const agent = await db.agent.findUnique({ where: { userId: user.id } })
    if (agent) {
        activeMission = await db.mission.findFirst({
            where: {
                agentId: agent.id,
                status: {
                    in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS']
                }
            },
            include: { company: true }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <MissionNotifications userId={user.id} />
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">🛡️ Dashboard Agent</h1>
                            <p className="text-gray-600">Bienvenue, {user.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/agent/history"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                📜 Mes Missions Passées
                            </Link>
                            <LogoutButton />
                        </div>
                    </div>
                </div>

                {/* Verification Status Banner */}
                {!isVerified && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Votre compte n'est pas encore vérifié. Veuillez fournir les documents requis pour accéder aux missions.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isVerified && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    Compte vérifié. Vous pouvez maintenant accepter des missions.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mission Section */}
                {isVerified && (
                    <div className="mt-8 border-t pt-8">
                        <h2 className="text-2xl font-bold mb-4">Espace Opérationnel</h2>

                        <div>
                            {activeMission ? (
                                <ActiveMission mission={activeMission} />
                            ) : (
                                <>
                                    <p className="mb-4 text-gray-600">Activez votre géolocalisation pour recevoir des missions.</p>
                                    <LocationSimulator />
                                    <div className="mt-6">
                                        <MissionProposals />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Document Upload Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {docStatus.map((doc, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold mb-4 flex items-center justify-between">
                                {doc.label}
                                {doc.uploaded && (
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${doc.uploaded.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                        doc.uploaded.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {doc.uploaded.status === 'VERIFIED' ? 'Vérifié' :
                                            doc.uploaded.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                    </span>
                                )}
                            </h3>

                            {!doc.uploaded || doc.uploaded.status === 'REJECTED' ? (
                                <DocumentUpload type={doc.type} label={doc.label} />
                            ) : (
                                <div className="text-sm text-gray-500">
                                    <p>Fichier envoyé : {doc.uploaded.name}</p>
                                    <p>Date : {new Date(doc.uploaded.createdAt).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
