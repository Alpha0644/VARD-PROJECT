'use client'

import { useState } from 'react'
import { Calendar, Loader2 } from 'lucide-react'

interface VerifyDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (date?: Date) => Promise<void>
    documentType: string
    documentName: string
}

export function VerifyDocumentModal({
    isOpen,
    onClose,
    onConfirm,
    documentType,
    documentName
}: VerifyDocumentModalProps) {
    const [date, setDate] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    // Documents that REQUIRE an expiration date
    const requiresDate = ['CNAPS', 'INSURANCE', 'ID_CARD'].includes(documentType)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (requiresDate && !date) {
            setError('La date d\'expiration est requise pour ce document')
            return
        }

        setIsLoading(true)
        try {
            await onConfirm(date ? new Date(date) : undefined)
            onClose()
        } catch (err) {
            console.error(err)
            setError('Une erreur est survenue lors de la validation')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Valider le document
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {documentName} <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded ml-1">{documentType}</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {requiresDate && (
                            <div className="space-y-2">
                                <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">
                                    Date d'expiration <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        id="expiration"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                        min={new Date().toISOString().split('T')[0]} // Optional: prevent past dates if strict, but maybe admin allows explicit override? Let's leave it open or simple.
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Vérifiez la date inscrite sur le document.
                                </p>
                            </div>
                        )}

                        {!requiresDate && (
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                                Ce type de document ne nécessite pas de date d'expiration.
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmer la validation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
