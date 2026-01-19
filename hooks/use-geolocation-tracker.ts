"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface GeolocationState {
    latitude: number | null
    longitude: number | null
    accuracy: number | null
    error: string | null
    isTracking: boolean
}

interface UseGeolocationTrackerOptions {
    missionId: string
    intervalMs?: number // How often to send updates (default 10s)
    enabled?: boolean
}

export function useGeolocationTracker({ missionId, intervalMs = 10000, enabled = true }: UseGeolocationTrackerOptions) {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        isTracking: false,
    })

    const watchIdRef = useRef<number | null>(null)
    const lastSentRef = useRef<number>(0)

    const sendLocation = useCallback(async (lat: number, lng: number) => {
        const now = Date.now()
        // Throttle: only send if enough time has passed
        if (now - lastSentRef.current < intervalMs) return

        try {
            const res = await fetch('/api/agent/location/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    missionId,
                    latitude: lat,
                    longitude: lng,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                console.error('[GPS Tracker] API error:', data.error)
            } else {
                lastSentRef.current = now
                console.log('[GPS Tracker] Location sent:', lat, lng)
            }
        } catch (e) {
            console.error('[GPS Tracker] Network error:', e)
        }
    }, [missionId, intervalMs])

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'Geolocation not supported', isTracking: false }))
            return
        }

        setState(prev => ({ ...prev, isTracking: true, error: null }))

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords
                setState(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    accuracy,
                    error: null,
                }))
                sendLocation(latitude, longitude)
            },
            (error) => {
                let errorMsg = 'Unknown error'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Permission refusée'
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Position indisponible'
                        break
                    case error.TIMEOUT:
                        errorMsg = 'Timeout'
                        break
                }
                setState(prev => ({ ...prev, error: errorMsg, isTracking: false }))
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000,
            }
        )
    }, [sendLocation])

    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setState(prev => ({ ...prev, isTracking: false }))
    }, [])

    useEffect(() => {
        if (enabled) {
            startTracking()
        } else {
            stopTracking()
        }

        return () => stopTracking()
    }, [enabled, startTracking, stopTracking])

    return {
        ...state,
        startTracking,
        stopTracking,
    }
}
