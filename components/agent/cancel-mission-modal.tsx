'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, XCircle, Loader2 } from 'lucide-react'

interface CancelMissionModalProps {
    missionId: string
    isOpen: boolean
    onClose: () => void
}

export function CancelMissionModal({ missionId, isOpen, onClose }: CancelMissionModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Warning, 2: Confirmation
    const router = useRouter()

    if (!isOpen) return null

    const handleCancel = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/missions/${missionId}/cancel`, {
                method: 'POST'
            })

            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Erreur lors de l\'annulation')
                setIsLoading(false)
                return
            }

            // Success
            router.refresh()
            onClose()
        } catch (error) {
            console.error(error)
            alert('Erreur technique')
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                {step === 1 ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Attention !
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            L'annulation d'une mission acceptée impacte négativement votre score de fiabilité.
                            <br /><br />
                            <strong>Cette action est irréversible.</strong> La mission sera remise à disposition des autres agents.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Je veux annuler la mission
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Retour (Conseillé)
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className={`w-6 h-6 text-red-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Confirmation finale
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Confirmez-vous l'annulation définitive de cette mission ?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
