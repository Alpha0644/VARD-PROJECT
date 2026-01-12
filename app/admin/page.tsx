import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminDocumentList } from '@/components/admin/admin-document-list'
import { AdminMissionList } from '@/components/admin/admin-mission-list'
import { MissionWithCompany } from '@/lib/types/mission'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function AdminPage() {
    const session = await auth()

    // 1. Strict Security Check
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    // 2. Fetch Data (Parallel)
    const [pendingDocuments, allMissions] = await Promise.all([
        db.document.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: { name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        db.mission.findMany({
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        })
    ])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Administration 👮‍♂️</h1>
                        <p className="text-gray-600">Gérez les validations et supervisez les missions.</p>
                    </div>
                    <LogoutButton />
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left Column: Documents */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            Documents en attente
                            {pendingDocuments.length > 0 && (
                                <span className="ml-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                    {pendingDocuments.length}
                                </span>
                            )}
                        </h2>
                        <AdminDocumentList documents={pendingDocuments} />
                    </div>

                    {/* Right Column: Missions (Simplified View) */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Missions récentes</h2>
                        <AdminMissionList missions={allMissions as MissionWithCompany[]} />
                    </div>
                </div>
            </div>
        </div>
    )
}
