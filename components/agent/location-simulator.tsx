'use client'

import { useState, useEffect } from 'react'

export function LocationSimulator() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'IDLE' | 'ACTIVE' | 'CHECKING'>('CHECKING')

    // Check if location already exists on mount
    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch('/api/agent/location/status')
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data.active ? 'ACTIVE' : 'IDLE')
                } else {
                    setStatus('IDLE')
                }
            } catch {
                setStatus('IDLE')
            }
        }
        checkStatus()
    }, [])

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
                setStatus('ACTIVE')
                // Remove alert to avoid interruption, use UI feedback instead
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-blue-900">📡 Simulateur GPS</h2>
                    <p className="text-sm text-blue-800">
                        Simulez votre position pour tester le moteur de matching.
                    </p>
                </div>
                {status === 'ACTIVE' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Actif (Paris)
                    </span>
                )}
            </div>

            <button
                onClick={simulateLocation}
                disabled={loading || status === 'ACTIVE' || status === 'CHECKING'}
                aria-label="Activer la simulation de géolocalisation à Paris"
                className={`w-full py-2 rounded transition font-medium ${status === 'ACTIVE'
                    ? 'bg-green-600 text-white cursor-default'
                    : status === 'CHECKING'
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {loading ? 'Activation...' : status === 'CHECKING' ? 'Vérification...' : status === 'ACTIVE' ? '✅ Localisation Active' : '📍 Je suis à Paris (Activer Matching)'}
            </button>

            {status === 'ACTIVE' && (
                <p className="mt-2 text-xs text-green-700 text-center">
                    Le module de matching vous détecte maintenant dans la zone.
                </p>
            )}
        </div>
    )
}
