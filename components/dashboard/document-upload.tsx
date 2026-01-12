'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DocumentUploadProps {
    type: 'CNAPS' | 'ID_CARD' | 'SIREN_FIRM' | 'INSURANCE'
    label: string
    description?: string
}

export function DocumentUpload({ type, label, description }: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Le fichier est trop volumineux (max 5MB)')
                return
            }
            setFile(selectedFile)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include', // Force cookie sending
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Erreur lors de l'upload")
            }

            setSuccess(true)
            setFile(null)
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
            setError(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{label}</h3>
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>
                {success && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Envoyé
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    aria-label={`Sélectionner un fichier pour ${label}`}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                    disabled={uploading || success}
                />

                {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}

                {file && !success && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        aria-label={`Envoyer le document ${label}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {uploading ? 'Envoi en cours...' : 'Envoyer le document'}
                    </button>
                )}
            </div>
        </div>
    )
}
