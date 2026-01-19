"use client"

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker'

interface LiveTrackingToggleProps {
    missionId: string
}

export function LiveTrackingToggle({ missionId }: LiveTrackingToggleProps) {
    const { isTracking, latitude, longitude, accuracy, error, startTracking, stopTracking } = useGeolocationTracker({
        missionId,
        enabled: false, // Start disabled, user must opt-in
    })

    const handleToggle = () => {
        if (isTracking) {
            stopTracking()
        } else {
            startTracking()
        }
    }

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-gray-900">📍 Tracking GPS</h4>
                    <p className="text-sm text-gray-500">
                        {isTracking ? 'Position envoyée en temps réel' : 'Activez pour être suivi'}
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${isTracking
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                >
                    {isTracking ? '⏹ Arrêter' : '▶ Activer'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-2">
                    ⚠️ {error}
                </div>
            )}

            {isTracking && latitude && longitude && (
                <div className="text-xs text-gray-400 font-mono">
                    📍 {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    {accuracy && ` (±${accuracy.toFixed(0)}m)`}
                </div>
            )}
        </div>
    )
}
