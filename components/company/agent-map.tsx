"use client"

import { useEffect, useRef, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import dynamic from 'next/dynamic'

interface AgentMapProps {
    missionId: string
    agentId: string
    initialPosition?: { lat: number; lng: number }
}

interface LocationEvent {
    agentId: string
    latitude: number
    longitude: number
    timestamp: string
}

// Dynamically import Leaflet to avoid SSR issues
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

export function AgentMap({ missionId, agentId, initialPosition }: AgentMapProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        initialPosition || null
    )
    const [lastUpdate, setLastUpdate] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Import Leaflet CSS on client-side only
        // @ts-expect-error - CSS module import
        import('leaflet/dist/leaflet.css')
    }, [])

    useEffect(() => {
        const channelName = `presence-mission-${missionId}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true)
            console.log('[AgentMap] Subscribed to', channelName)
        })

        channel.bind('agent:location', (data: LocationEvent) => {
            if (data.agentId === agentId) {
                setPosition({ lat: data.latitude, lng: data.longitude })
                setLastUpdate(new Date(data.timestamp).toLocaleTimeString())
                console.log('[AgentMap] Location update:', data)
            }
        })

        return () => {
            pusherClient.unsubscribe(channelName)
        }
    }, [missionId, agentId])

    if (!position) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="animate-pulse">
                    <p className="text-gray-500 mb-2">🗺️ En attente de la position de l&apos;agent...</p>
                    <p className="text-xs text-gray-400">
                        {isConnected ? '✅ Connecté' : '⏳ Connexion...'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="h-64 relative">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker position={[position.lat, position.lng]}>
                        <Popup>Agent en mission</Popup>
                    </Marker>
                </MapContainer>
            </div>
            <div className="bg-white px-4 py-2 flex justify-between items-center text-sm">
                <span className="text-gray-500">
                    📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </span>
                {lastUpdate && (
                    <span className="text-green-600">
                        🔄 {lastUpdate}
                    </span>
                )}
            </div>
        </div>
    )
}
