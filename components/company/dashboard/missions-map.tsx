'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { pusherClient } from '@/lib/pusher-client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Users, Eye } from 'lucide-react'

// Dynamic imports for Leaflet
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
)

interface Mission {
    id: string
    title: string
    location: string
    status: string
    latitude: number
    longitude: number
    agent?: {
        id: string
        user: {
            name: string
        }
    }
    agentPosition?: {
        lat: number
        lng: number
    }
}

interface MissionsMapProps {
    missions: Mission[]
    companyId: string
}

const statusColors: Record<string, string> = {
    'PENDING': '#9CA3AF',      // gray
    'ACCEPTED': '#3B82F6',     // blue
    'EN_ROUTE': '#F59E0B',     // amber
    'ARRIVED': '#8B5CF6',      // purple
    'IN_PROGRESS': '#06B6D4',  // cyan
    'COMPLETED': '#10B981',    // green
}

export function MissionsMap({ missions: initialMissions, companyId }: MissionsMapProps) {
    const [missions, setMissions] = useState<Mission[]>(initialMissions)
    const [agentPositions, setAgentPositions] = useState<Record<string, { lat: number; lng: number }>>({})
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        // Subscribe to real-time updates for each active mission
        const channels: string[] = []

        missions.forEach(mission => {
            if (mission.agent && ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(mission.status)) {
                const channelName = `presence-mission-${mission.id}`
                channels.push(channelName)
                const channel = pusherClient.subscribe(channelName)

                channel.bind('agent:location', (data: { agentId: string; latitude: number; longitude: number }) => {
                    setAgentPositions(prev => ({
                        ...prev,
                        [mission.id]: { lat: data.latitude, lng: data.longitude }
                    }))
                })
            }
        })

        return () => {
            channels.forEach(ch => pusherClient.unsubscribe(ch))
        }
    }, [missions])

    // Calculate map center
    const getCenter = (): [number, number] => {
        if (missions.length === 0) return [48.8566, 2.3522] // Paris default
        const lat = missions.reduce((sum, m) => sum + m.latitude, 0) / missions.length
        const lng = missions.reduce((sum, m) => sum + m.longitude, 0) / missions.length
        return [lat, lng]
    }

    if (!isLoaded) {
        return (
            <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Chargement de la carte...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Carte des missions</h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full" /> En cours
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" /> En route
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                        <span className="w-2 h-2 bg-gray-400 rounded-full" /> En attente
                    </span>
                </div>
            </div>

            {/* Map */}
            <div className="h-80">
                {missions.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Aucune mission active</p>
                            <p className="text-sm text-gray-400 mt-1">Créez une mission pour la voir ici</p>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={getCenter()}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap'
                        />

                        {/* Mission markers */}
                        {missions.map(mission => (
                            <Marker
                                key={mission.id}
                                position={[mission.latitude, mission.longitude]}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h4 className="font-bold text-gray-900">{mission.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{mission.location}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: statusColors[mission.status] }}
                                            />
                                            <span className="text-xs font-medium">{mission.status}</span>
                                        </div>
                                        {mission.agent && (
                                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {mission.agent.user.name}
                                            </p>
                                        )}
                                        <Link
                                            href={`/company/missions/${mission.id}`}
                                            className="mt-2 block w-full text-center py-1.5 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700"
                                        >
                                            <Eye className="w-3 h-3 inline mr-1" />
                                            Suivre
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Agent live positions */}
                        {Object.entries(agentPositions).map(([missionId, pos]) => (
                            <Marker
                                key={`agent-${missionId}`}
                                position={[pos.lat, pos.lng]}
                            >
                                <Popup>
                                    <span className="text-xs">Position agent (live)</span>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                    {missions.length} mission{missions.length > 1 ? 's' : ''} affichée{missions.length > 1 ? 's' : ''}
                </span>
                <Link
                    href="/company/missions"
                    className="text-blue-600 hover:underline font-medium"
                >
                    Voir toutes les missions
                </Link>
            </div>
        </div>
    )
}
