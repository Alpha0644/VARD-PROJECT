import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AgentMap } from '@/components/company/agent-map'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CompanyMissionDetailPage({ params }: PageProps) {
    const { id: missionId } = await params
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const company = await db.company.findUnique({
        where: { userId: session.user.id }
    })

    if (!company) {
        redirect('/company/dashboard')
    }

    const mission = await db.mission.findFirst({
        where: {
            id: missionId,
            companyId: company.id
        },
        include: {
            agent: {
                include: { user: true }
            }
        }
    })

    if (!mission) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Mission non trouvée</h1>
                <Link href="/company/dashboard" className="text-blue-600 underline mt-4 block">
                    ← Retour au dashboard
                </Link>
            </div>
        )
    }

    const isActive = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(mission.status)

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link href="/company/dashboard" className="text-blue-600 text-sm mb-4 inline-block">
                ← Retour au dashboard
            </Link>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                    <h1 className="text-white text-xl font-bold">{mission.title}</h1>
                    <p className="text-blue-100 text-sm">{mission.location}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mission Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-500 text-sm">Statut</p>
                            <p className="font-bold text-lg">{mission.status}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-500 text-sm">Agent</p>
                            <p className="font-bold text-lg">
                                {mission.agent?.user.name || 'Non assigné'}
                            </p>
                        </div>
                    </div>

                    {/* GPS Map */}
                    {isActive && mission.agent && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                📍 Position de l&apos;agent en temps réel
                            </h2>
                            <AgentMap
                                missionId={mission.id}
                                agentId={mission.agent.id}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                La position se met à jour automatiquement lorsque l&apos;agent active le tracking.
                            </p>
                        </div>
                    )}

                    {!isActive && (
                        <div className="bg-gray-100 rounded-lg p-6 text-center">
                            <p className="text-gray-500">
                                {mission.status === 'PENDING'
                                    ? '⏳ En attente d\'acceptation par un agent'
                                    : mission.status === 'COMPLETED'
                                        ? '✅ Mission terminée'
                                        : 'Le tracking GPS n\'est pas disponible pour cette mission.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
