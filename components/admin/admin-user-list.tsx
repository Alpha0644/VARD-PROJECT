'use client'

import { formatDate } from '@/lib/utils'

import { useState } from 'react'
import { Search, UserCog, CheckCircle, Clock } from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    isVerified: boolean
    createdAt: Date
    _count?: {
        createdMissions?: number // Company
        assignedMissions?: number // Agent
    }
}

interface AdminUserListProps {
    users: User[]
}

export function AdminUserList({ users }: AdminUserListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Utilisateur</th>
                            <th className="px-6 py-3">Rôle</th>
                            <th className="px-6 py-3">Statut</th>
                            <th className="px-6 py-3">Missions</th>
                            <th className="px-6 py-3 text-right">Date d'inscription</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <span className="font-bold text-xs text-slate-600">
                                                    {user.name?.substring(0, 2).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || 'Sans nom'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${user.role === 'AGENT'
                                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                                            : user.role === 'COMPANY'
                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isVerified ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> Vérifié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
                                                <Clock className="w-3 h-3" /> En attente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {user.role === 'AGENT' ? (
                                            <span title="Missions assignées">{user._count?.assignedMissions || 0}</span>
                                        ) : (
                                            <span title="Missions créées">{user._count?.createdMissions || 0}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
