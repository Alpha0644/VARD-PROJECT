import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminUserList } from '@/components/admin/admin-user-list'

export default async function AdminUsersPage() {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const rawUsers = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            companyProfile: {
                select: {
                    _count: {
                        select: { missions: true }
                    }
                }
            },
            agentProfile: {
                select: {
                    _count: {
                        select: { missions: true }
                    }
                }
            }
        },
        take: 100 // Limit for performance
    })

    // Transform to match key interface expected by component
    const users = rawUsers.map(user => ({
        ...user,
        _count: {
            createdMissions: user.companyProfile?._count.missions || 0,
            assignedMissions: user.agentProfile?._count.missions || 0
        }
    }))

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                    <p className="text-gray-500">Liste complète des Agents et Entreprises inscrits.</p>
                </div>

                <AdminUserList users={users} />
            </div>
        </div>
    )
}
