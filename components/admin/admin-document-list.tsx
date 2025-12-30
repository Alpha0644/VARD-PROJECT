'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserPreview {
    name: string | null
    email: string | null
    role: string
}

interface DocumentWithUser {
    id: string
    type: string
    status: string
    name: string
    createdAt: Date
    user: UserPreview
}

interface AdminDocumentListProps {
    documents: DocumentWithUser[]
}

export function AdminDocumentList({ documents }: AdminDocumentListProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleUpdateStatus = async (docId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
        setIsLoading(docId)
        try {
            const res = await fetch('/api/admin/documents', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: docId, status: newStatus }),
            })

            if (!res.ok) throw new Error('Failed to update')

            router.refresh()
        } catch (error) {
            console.error('Error updating document:', error)
            alert('Erreur lors de la mise à jour')
        } finally {
            setIsLoading(null)
        }
    }

    if (documents.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                Aucun document en attente de validation. ✅
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900">{doc.type}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${doc.user.role === 'AGENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                {doc.user.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Utilisateur: <span className="font-medium">{doc.user.name || doc.user.email}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Reçu le {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        <a
                            href={`/uploads/${doc.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block font-medium underline"
                        >
                            Voir le fichier 📄
                        </a>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleUpdateStatus(doc.id, 'REJECTED')}
                            disabled={isLoading === doc.id}
                            className="px-4 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            Rejeter
                        </button>
                        <button
                            onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                            disabled={isLoading === doc.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isLoading === doc.id ? '...' : 'Valider'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
