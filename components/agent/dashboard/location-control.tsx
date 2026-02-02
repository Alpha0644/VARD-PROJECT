'use client'

import { useState, useEffect } from 'react'
import { MapPin, MapPinOff, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface LocationControlProps {
    userId?: string
    onLocationUpdate?: (position: [number, number]) => void
}

export function LocationControl({ userId, onLocationUpdate }: LocationControlProps) {
    const [isLocating, setIsLocating] = useState(false)
    const [hasLocation, setHasLocation] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [expanded, setExpanded] = useState(false)

    // Check if we have stored position on mount
    useEffect(() => {
        if (userId) {
            fetch('/api/agent/location')
                .then(res => res.json())
                .then(data => {
                    if (data.latitude && data.longitude) {
                        setHasLocation(true)
                        setLastUpdate(new Date(data.updatedAt || Date.now()))
                    }
                })
                .catch(() => { })
        }
    }, [userId])

    const requestLocation = async () => {
        if (!navigator.geolocation) {
            toast.error('Géolocalisation non supportée par votre navigateur')
            return
        }

        setIsLocating(true)

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                })
            })

            const { latitude, longitude } = position.coords

            // Sync to server
            const response = await fetch('/api/agent/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude })
            })

            if (response.ok) {
                setHasLocation(true)
                setLastUpdate(new Date())
                onLocationUpdate?.([latitude, longitude])
                toast.success('Position mise à jour !', {
                    description: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                })
            } else {
                throw new Error('Server sync failed')
            }
        } catch (error: any) {
            console.error('Location error:', error)

            if (error.code === 1) {
                toast.error('Permission GPS refusée', {
                    description: 'Autorisez la géolocalisation dans les paramètres de votre navigateur.'
                })
            } else if (error.code === 2) {
                toast.error('Position indisponible', {
                    description: 'Vérifiez que le GPS est activé sur votre appareil.'
                })
            } else if (error.code === 3) {
                toast.error('Timeout', {
                    description: 'La récupération de la position a pris trop de temps.'
                })
            } else {
                toast.error('Erreur de localisation', {
                    description: error.message || 'Impossible de récupérer votre position.'
                })
            }
        } finally {
            setIsLocating(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setExpanded(!expanded)}
                className={`bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border transition-all ${hasLocation
                        ? 'border-green-300 text-green-600'
                        : 'border-orange-300 text-orange-600'
                    }`}
                title={hasLocation ? 'Position active' : 'Position non définie'}
            >
                {hasLocation ? (
                    <MapPin className="w-6 h-6" />
                ) : (
                    <MapPinOff className="w-6 h-6" />
                )}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[220px] z-50"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {hasLocation ? (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                ) : (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                    {hasLocation ? 'Position active' : 'Position requise'}
                                </span>
                            </div>

                            {lastUpdate && (
                                <p className="text-xs text-gray-500">
                                    Mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                                </p>
                            )}

                            {!hasLocation && (
                                <p className="text-xs text-orange-600">
                                    Activez votre position pour recevoir les missions proches.
                                </p>
                            )}

                            <button
                                onClick={requestLocation}
                                disabled={isLocating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isLocating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Localisation...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        {hasLocation ? 'Actualiser' : 'Activer GPS'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
