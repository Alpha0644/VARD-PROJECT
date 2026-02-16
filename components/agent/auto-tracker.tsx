'use client'

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker'
import { useEffect } from 'react'
import { toast } from 'sonner' // Assuming sonner is installed/configured as per package.json

export function AutoTracker({ missionId, status }: { missionId: string; status: string }) {
    const shouldTrack = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(status)

    const { isTracking, error, startTracking, stopTracking } = useGeolocationTracker({
        missionId,
        enabled: false // We control it via effect below
    })

    useEffect(() => {
        if (shouldTrack && !isTracking) {
            startTracking()
            toast.info('📍 Tracking GPS activé')
        } else if (!shouldTrack && isTracking) {
            stopTracking()
            toast.info('⏹ Fin du tracking')
        }
    }, [shouldTrack, isTracking, startTracking, stopTracking])

    // Minimal UI feedback (optional, since it's "zero click")
    if (error) return <div className="text-red-500 text-xs mb-4">⚠️ Erreur GPS: {error}</div>
    if (isTracking) return <div className="text-green-500 text-xs mb-4 animate-pulse">📡 Position partagée en temps réel</div>

    return null
}
