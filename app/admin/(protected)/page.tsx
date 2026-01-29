import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminAnalyticsClient } from '@/components/admin/admin-analytics-client'

export default async function AdminDashboardPage() {
    const session = await auth()

    // Double check Role
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Control Tower 🏰</h1>
                <p className="text-gray-500">Vue d'ensemble et pilotage de la plateforme VARD.</p>
            </div>

            <AdminAnalyticsClient />
        </div>
    )
}
