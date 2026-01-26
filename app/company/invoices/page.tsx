import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { FileText, Download, Filter } from 'lucide-react'

export default async function CompanyInvoicesPage() {
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
                        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
                        <p className="text-gray-500 mt-1">Consultez et téléchargez vos factures</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Exporter tout
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Période
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">Toutes</button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Payées</button>
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">En attente</button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune facture</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Vous n&apos;avez pas encore de factures. Les factures de vos missions terminées apparaîtront ici.
                    </p>
                </div>
            </div>
        </B2BLayout>
    )
}
