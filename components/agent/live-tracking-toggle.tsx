"use client"

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker'
import { useEffect, useRef } from 'react'

interface LiveTrackingToggleProps {
    missionId: string
    isActive?: boolean
    onActiveChange?: (active: boolean) => void
}

export function LiveTrackingToggle({ missionId, isActive, onActiveChange }: LiveTrackingToggleProps) {
    const { isTracking, latitude, longitude, accuracy, error, startTracking, stopTracking } = useGeolocationTracker({
        missionId,
        enabled: false, // Always start disabled, control via effect
    })

    const hasStartedRef = useRef(false)

    // Sync with parent's isActive state
    useEffect(() => {
        if (isActive && !isTracking && !hasStartedRef.current) {
            hasStartedRef.current = true
            startTracking()
        }
    }, [isActive, isTracking, startTracking])

    const handleToggle = () => {
        if (isTracking) {
            stopTracking()
            hasStartedRef.current = false
            onActiveChange?.(false)
        } else {
            startTracking()
            hasStartedRef.current = true
            onActiveChange?.(true)
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

