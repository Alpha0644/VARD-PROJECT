"use client"

import { useEffect, useState } from 'react'
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

// Dynamically import Leaflet components to avoid SSR issues
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

// Component to update map center dynamically
function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
    const [map, setMap] = useState<L.Map | null>(null)

    useEffect(() => {
        // Dynamic import of useMap to avoid SSR issues
        import('react-leaflet').then(({ useMap }) => {
            // This won't work because useMap must be called in render
            // We'll use a different approach
        })
    }, [])

    useEffect(() => {
        if (map) {
            map.setView([position.lat, position.lng], map.getZoom())
        }
    }, [position, map])

    return null
}

// Proper way to update map - we use a callback on MapContainer
function MapWithUpdates({
    position,
    lastUpdate
}: {
    position: { lat: number; lng: number }
    lastUpdate: string | null
}) {
    const [map, setMap] = useState<L.Map | null>(null)

    useEffect(() => {
        if (map) {
            map.setView([position.lat, position.lng], map.getZoom(), { animate: true })
        }
    }, [position, map])

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="h-64 relative">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    ref={setMap}
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
                    <span className="text-green-600 animate-pulse">
                        🔄 {lastUpdate}
                    </span>
                )}
            </div>
        </div>
    )
}

export function AgentMap({ missionId, agentId, initialPosition }: AgentMapProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        initialPosition || null
    )
    const [lastUpdate, setLastUpdate] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null)

    useEffect(() => {
        // Import Leaflet CSS on client-side only
        // @ts-expect-error - CSS module import
        import('leaflet/dist/leaflet.css')
    }, [])

    useEffect(() => {
        const channelName = `presence-mission-${missionId}`
        console.log('[AgentMap] Subscribing to', channelName)
        const channel = pusherClient.subscribe(channelName)

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true)
            setSubscriptionError(null)
            console.log('[AgentMap] ✅ Subscribed to', channelName)
        })

        channel.bind('pusher:subscription_error', (error: unknown) => {
            console.error('[AgentMap] ❌ Subscription error:', error)
            setSubscriptionError('Erreur de connexion')
        })

        channel.bind('agent:location', (data: LocationEvent) => {
            console.log('[AgentMap] 📍 Location event received:', data)
            if (data.agentId === agentId) {
                setPosition({ lat: data.latitude, lng: data.longitude })
                setLastUpdate(new Date(data.timestamp).toLocaleTimeString())
            }
        })

        return () => {
            console.log('[AgentMap] Unsubscribing from', channelName)
            pusherClient.unsubscribe(channelName)
        }
    }, [missionId, agentId])

    if (!position) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="animate-pulse">
                    <p className="text-gray-500 mb-2">🗺️ En attente de la position de l&apos;agent...</p>
                    <p className="text-xs text-gray-400">
                        {subscriptionError ? `❌ ${subscriptionError}` : isConnected ? '✅ Connecté - En attente du GPS' : '⏳ Connexion...'}
                    </p>
                </div>
            </div>
        )
    }

    return <MapWithUpdates position={position} lastUpdate={lastUpdate} />
}

