'use client'

import { MissionWithCompany } from '@/lib/types/mission'

interface AdminMissionListProps {
    missions: MissionWithCompany[]
}

const STATUS_LABELS: Record<string, string> = {
    'PENDING': 'En attente',
    'ACCEPTED': 'Acceptée',
    'EN_ROUTE': 'En route',
    'ARRIVED': 'Sur place',
    'IN_PROGRESS': 'En cours',
    'COMPLETED': 'Terminée',
    'CANCELLED': 'Annulée'
}

const STATUS_COLORS: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'ACCEPTED': 'bg-blue-100 text-blue-800',
    'EN_ROUTE': 'bg-indigo-100 text-indigo-800',
    'ARRIVED': 'bg-purple-100 text-purple-800',
    'IN_PROGRESS': 'bg-orange-100 text-orange-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
}

export function AdminMissionList({ missions }: AdminMissionListProps) {
    if (missions.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                Aucune mission enregistrée.
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {missions.map((mission) => (
                        <tr key={mission.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{mission.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{mission.company.companyName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{mission.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[mission.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {STATUS_LABELS[mission.status] || mission.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(mission.startTime).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
