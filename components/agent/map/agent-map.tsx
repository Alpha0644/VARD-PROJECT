'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState, useCallback } from 'react'
import { Navigation, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

// Custom icons
const agentIcon = L.divIcon({
    className: 'agent-marker',
    html: `<div style="
        width: 24px; 
        height: 24px; 
        background: #3B82F6; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
})

const missionIcon = L.divIcon({
    className: 'mission-marker',
    html: `<div style="
        width: 32px; 
        height: 32px; 
        background: #FF6B35; 
        border: 3px solid white; 
        border-radius: 8px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    ">🛡️</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
})

// Mission type for markers
interface MissionMarker {
    id: string
    title: string
    description?: string
    location: string
    company: { companyName: string }
    startTime: string
    endTime: string
    latitude: number
    longitude: number
}

interface AgentMapProps {
    missions?: MissionMarker[]
    onMissionClick?: (mission: MissionMarker) => void
}

// Recenter button component
function RecenterButton({ position }: { position: [number, number] | null }) {
    const map = useMap()

    const handleRecenter = useCallback(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1 })
        }
    }, [map, position])

    if (!position) return null

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRecenter}
            className="absolute bottom-28 right-4 z-[1000] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Recentrer sur ma position"
        >
            <Navigation className="w-5 h-5 text-blue-600" />
        </motion.button>
    )
}

// Format time helper
const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Calculate distance between two points
const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export function AgentMap({ missions = [], onMissionClick }: AgentMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [position, setPosition] = useState<[number, number] | null>(null)
    const [watchId, setWatchId] = useState<number | null>(null)

    useEffect(() => {
        setIsMounted(true)

        // Watch position for real-time updates
        if (navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude])
                },
                (err) => console.error('Geolocation error:', err),
                { enableHighAccuracy: true, timeout: 10000 }
            )
            setWatchId(id)
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [])

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/70 text-sm">Chargement de la carte...</span>
                </div>
            </div>
        )
    }

    // Paris default center if no position yet
    const center: [number, number] = position || [48.8566, 2.3522]

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Agent Position Marker */}
                {position && (
                    <Marker position={position} icon={agentIcon}>
                        <Popup>
                            <div className="font-medium">📍 Votre position</div>
                        </Popup>
                    </Marker>
                )}

                {/* Mission Markers */}
                {missions
                    .filter((mission) =>
                        typeof mission.latitude === 'number' &&
                        typeof mission.longitude === 'number' &&
                        !isNaN(mission.latitude) &&
                        !isNaN(mission.longitude)
                    )
                    .map((mission) => {
                        const distance = position
                            ? calculateDistance(position[0], position[1], mission.latitude, mission.longitude)
                            : null

                        return (
                            <Marker
                                key={mission.id}
                                position={[mission.latitude, mission.longitude]}
                                icon={missionIcon}
                                eventHandlers={{
                                    click: () => onMissionClick?.(mission)
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-gray-900 mb-1">{mission.title}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{mission.company.companyName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{mission.location}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            🕐 {formatTime(mission.startTime)} - {formatTime(mission.endTime)}
                                        </div>
                                        {distance !== null && (
                                            <div className="text-xs font-medium text-blue-600">
                                                📍 {distance.toFixed(1)} km
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}

                {/* Recenter Button */}
                <RecenterButton position={position} />
            </MapContainer>
        </div>
    )
}
