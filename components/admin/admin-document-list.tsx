import { useState } from 'react'
import { verifyDocumentAction, rejectDocumentAction } from '@/app/admin/documents/actions'
import { CheckCircle, XCircle, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { VerifyDocumentModal } from './verify-document-modal'

interface UserPreview {
    name: string | null
    email: string | null
    role: string
}

interface DocumentWithUser {
    id: string
    userId: string
    type: string
    status: string
    url: string
    name: string
    createdAt: Date
    user: UserPreview
}

interface AdminDocumentListProps {
    documents: DocumentWithUser[]
}

export function AdminDocumentList({ documents }: AdminDocumentListProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [selectedDoc, setSelectedDoc] = useState<DocumentWithUser | null>(null)

    const handleVerifyClick = (doc: DocumentWithUser) => {
        setSelectedDoc(doc)
    }

    const handleConfirmVerification = async (date?: Date) => {
        if (!selectedDoc) return

        setIsLoading(selectedDoc.id)
        const result = await verifyDocumentAction(selectedDoc.id, selectedDoc.userId, date)

        if (result.error) {
            alert('Erreur: ' + result.error)
            setIsLoading(null)
        }
        setSelectedDoc(null)
    }

    const handleReject = async (docId: string) => {
        if (!confirm('Rejeter ce document ?')) return

        setIsLoading(docId)
        const result = await rejectDocumentAction(docId)

        if (result.error) {
            alert('Erreur: ' + result.error)
            setIsLoading(null)
        }
    }

    if (documents.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Tout est à jour</h3>
                <p className="text-gray-500 mt-1">Aucun document en attente de validation. Bon travail ! ✅</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {/* Header: User Info */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${doc.type === 'CNAPS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                {doc.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${doc.user.role === 'AGENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {doc.user.role}
                            </span>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate" title={doc.user.email || ''}>
                            {doc.user.name || doc.user.email}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">{doc.user.email}</p>
                    </div>

                    {/* Content: Preview if possible */}
                    <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[120px] bg-slate-50 border-b border-gray-100 group relative">
                        {/* We can improve this with real image preview later if 'url' is provided */}
                        <FileText className="w-12 h-12 text-gray-300 mb-2 group-hover:text-blue-500 transition-colors" />
                        <p className="text-xs text-gray-500 mb-3 text-center break-all px-4">{doc.name}</p>

                        <a
                            href={doc.url || `/uploads/${doc.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Voir le fichier <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Footer: Actions */}
                    <div className="p-3 bg-white grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleReject(doc.id)}
                            disabled={isLoading === doc.id}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {isLoading === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Rejeter
                        </button>
                        <button
                            onClick={() => handleVerifyClick(doc)}
                            disabled={isLoading === doc.id}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 text-sm font-medium"
                        >
                            {isLoading === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Valider
                        </button>
                    </div>
                </div>
            ))}

            {selectedDoc && (
                <VerifyDocumentModal
                    isOpen={!!selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                    onConfirm={handleConfirmVerification}
                    documentType={selectedDoc.type}
                    documentName={selectedDoc.name}
                />
            )}
        </div>
    )
}
