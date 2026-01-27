'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarRating } from '@/components/ui/star-rating'
import { X, Loader2 } from 'lucide-react'

interface RateCompanyModalProps {
    isOpen: boolean
    onClose: () => void
    missionId: string
    companyId: string // This is actually userId of the company
    companyName: string
    onSuccess: () => void
}

export function RateCompanyModal({
    isOpen,
    onClose,
    missionId,
    companyId,
    companyName,
    onSuccess
}: RateCompanyModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    missionId,
                    targetId: companyId,
                    rating,
                    comment
                })
            })

            if (res.ok) {
                onSuccess()
                onClose()
            } else {
                alert('Erreur lors de l\'envoi de l\'avis')
            }
        } catch (error) {
            console.error('Rating error:', error)
            alert('Erreur serveur')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto p-6 relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Noter l'entreprise</h2>
                                <p className="text-gray-500 mt-1">
                                    Comment s'est passée la mission chez <span className="font-semibold text-gray-900">{companyName}</span> ?
                                </p>
                            </div>

                            <div className="flex justify-center mb-6">
                                <StarRating
                                    rating={rating}
                                    onRatingChange={setRating}
                                    editable={true}
                                    size="lg"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commentaire (optionnel)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Accueil, clarté des instructions..."
                                    className="w-full h-24 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Envoi...</span>
                                    </>
                                ) : (
                                    'Envoyer l\'avis'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
