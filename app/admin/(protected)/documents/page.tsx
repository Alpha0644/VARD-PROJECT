import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminDocumentList } from '@/components/admin/admin-document-list'

export default async function AdminDocumentsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const pendingDocuments = await db.document.findMany({
        where: { status: 'PENDING' },
        include: {
            user: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Transform date objects and handle potential nulls
    const formattedDocuments = pendingDocuments.map(doc => ({
        ...doc,
        url: doc.url || '', // Fallback empty string if null, UI handles it
        userId: doc.userId,
        // Ensure user is never null (database constraint should handle this, but for TS safety)
        user: doc.user || { name: 'Unknown', email: 'no-email', role: 'USER' }
    }))

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Validation des Documents</h1>
                        <p className="text-gray-500">Examinez et validez les pièces justificatives des agents.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="font-bold text-gray-900">{pendingDocuments.length}</span>
                        <span className="text-gray-500 ml-1">en attente</span>
                    </div>
                </div>

                <AdminDocumentList documents={formattedDocuments} />
            </div>
        </div>
    )
}
