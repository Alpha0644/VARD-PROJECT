import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { FileText, Users, Briefcase, AlertCircle } from 'lucide-react'

async function getAdminStats() {
    const [pendingDocs, totalAgents, totalCompanies, activeMissions] = await Promise.all([
        db.document.count({ where: { status: 'PENDING' } }),
        db.user.count({ where: { role: 'AGENT' } }),
        db.user.count({ where: { role: 'COMPANY' } }),
        db.mission.count({ where: { status: { in: ['ACCEPTED', 'IN_PROGRESS', 'EN_ROUTE', 'ARRIVED'] } } })
    ])

    return { pendingDocs, totalAgents, totalCompanies, activeMissions }
}

export default async function AdminDashboardPage() {
    const stats = await getAdminStats()

    const cards = [
        {
            label: 'Documents en attente',
            value: stats.pendingDocs,
            icon: AlertCircle,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            href: '/admin/documents'
        },
        {
            label: 'Missions en cours',
            value: stats.activeMissions,
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            href: '/admin/missions'
        },
        {
            label: 'Agents Inscrits',
            value: stats.totalAgents,
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-100',
            href: '/admin/users'
        },
        {
            label: 'Entreprises',
            value: stats.totalCompanies,
            icon: FileText,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            href: '/admin/users'
        },
    ]

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-500 mb-8">Vue d'ensemble de l'activité VARD.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
