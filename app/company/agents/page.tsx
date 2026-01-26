import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { Users, Plus, Search, Star } from 'lucide-react'

export default async function CompanyAgentsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes Agents</h1>
                        <p className="text-gray-500 mt-1">Gérez vos agents favoris et vos équipes</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Inviter un agent
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un agent..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun agent favori</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Vous n&apos;avez pas encore d&apos;agents dans votre équipe. Les agents que vous avez travaillé avec apparaîtront ici.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Star className="w-5 h-5" />
                        <span>Marquez un agent comme favori après une mission</span>
                    </div>
                </div>
            </div>
        </B2BLayout>
    )
}
