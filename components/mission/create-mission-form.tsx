'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateMissionForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            title: formData.get('title'),
            location: formData.get('location'),
            // Hardcoded dates for MVP demo
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
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
                alert('Mission créée ! Les agents alentours ont été notifiés.')
                router.refresh()
            } else {
                const err = await res.json()
                alert('Erreur: ' + err.error)
            }
        } catch (e) {
            console.error(e)
            alert('Erreur réseau')
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
                <button disabled={loading} className="w-full bg-black text-white py-2 rounded">
                    {loading ? 'Publication...' : 'Poster & Notifier Agents'}
                </button>
            </form>
        </div>
    )
}
