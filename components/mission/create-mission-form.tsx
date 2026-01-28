'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MISSION_DEFAULTS } from '@/lib/constants'

import { toast } from 'sonner'

export function CreateMissionForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            title: formData.get('title'),
            description: formData.get('description') || undefined,
            location: formData.get('location'),
            // Start in 1 hour to pass "future" validation
            startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + (MISSION_DEFAULTS.DURATION_HOURS + 1) * 60 * 60 * 1000).toISOString(),
            // Hardcoded Location (Paris Center) for MVP Matching Test
            latitude: 48.8566,
            longitude: 2.3522,
        }

        try {
            const res = await fetch('/api/missions', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.ok) {
                toast.success('Mission publiée avec succès !', {
                    description: 'Les agents à proximité ont été notifiés.'
                })

                // Reset form (safely)
                const form = e.currentTarget
                if (form) form.reset()
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                const errorMessage = data.error || 'Erreur lors de la création'

                toast.error('Erreur', {
                    description: errorMessage
                })
                console.error('[CreateMission] Error:', data)
            }
        } catch (e) {
            console.error('[CreateMission] Network error:', e)
            toast.error('Erreur réseau', {
                description: 'Vérifiez votre connexion internet.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">📢 Poster une Mission (Test)</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Titre de la mission</label>
                    <input required name="title" className="w-full border p-2 rounded" placeholder="Ex: Gardiennage chantier nuit" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Lieu (Nom)</label>
                    <input required name="location" className="w-full border p-2 rounded" placeholder="Paris, Île-de-France" />
                </div>
                <p className="text-xs text-gray-500">
                    ⚠️ Pour le test, cette mission sera géolocalisée automatiquement à <strong>Paris Centre</strong>.
                </p>
                <button
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded"
                    data-testid="submit-mission-btn"
                >
                    {loading ? 'Publication...' : 'Poster & Notifier Agents'}
                </button>
            </form>
        </div>
    )
}
