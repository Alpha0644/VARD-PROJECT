'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

interface CancelMissionModalProps {
    isOpen: boolean
    onClose: () => void
    missionId: string
    missionTitle: string
    hasAgent: boolean
    onSuccess: () => void
}

export function CancelMissionModal({
    isOpen,
    onClose,
    missionId,
    missionTitle,
    hasAgent,
    onSuccess
}: CancelMissionModalProps) {
    const [reason, setReason] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleCancel = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/missions/${missionId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason,
                    cancelledBy: 'COMPANY'
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erreur lors de l\'annulation')
            }

            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Annuler la mission</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir annuler la mission{' '}
                        <span className="font-medium text-gray-900">"{missionTitle}"</span> ?
                    </p>

                    {hasAgent && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-800 text-sm">
                                <strong>⚠️ Attention :</strong> Un agent a déjà accepté cette mission.
                                Il sera notifié de l'annulation.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Raison de l'annulation (optionnel)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none"
                            placeholder="Ex: Changement de planning, client annulé..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
                    >
                        Garder la mission
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Annulation...
                            </>
                        ) : (
                            'Confirmer l\'annulation'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
