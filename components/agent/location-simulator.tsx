'use client'

import { useState } from 'react'

export function LocationSimulator() {
    const [loading, setLoading] = useState(false)

    const simulateLocation = async () => {
        setLoading(true)
        try {
            // Simulate being in Paris Center (matches the mission mock)
            const data = {
                latitude: 48.8566,
                longitude: 2.3522
            }

            const res = await fetch('/api/agent/location', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.ok) {
                alert('📍 Position mise à jour : Vous êtes maintenant localisé à Paris !')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-bold mb-2 text-blue-900">📡 Simulateur GPS</h2>
            <p className="mb-4 text-sm text-blue-800">
                Simulez votre position pour tester le moteur de matching.
            </p>
            <button
                onClick={simulateLocation}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            >
                {loading ? 'Envoi...' : '📍 Je suis à Paris (Activer Matching)'}
            </button>
        </div>
    )
}
