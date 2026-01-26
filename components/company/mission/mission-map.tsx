'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

interface MissionMapProps {
    latitude: number
    longitude: number
    agentLocation?: { lat: number; lng: number }
}

export function MissionMap({ latitude, longitude, agentLocation }: MissionMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<L.Map | null>(null)

    useEffect(() => {
        if (!mapRef.current) return

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 13)

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapInstance.current)

            // Mission Marker (Blue)
            const missionIcon = L.divIcon({
                className: 'bg-transparent',
                html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })

            L.marker([latitude, longitude], { icon: missionIcon }).addTo(mapInstance.current)
        }

        // Cleanup
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove()
                mapInstance.current = null
            }
        }
    }, [latitude, longitude])

    // Update Agent Position
    useEffect(() => {
        if (!mapInstance.current || !agentLocation) return

        // Agent Marker (Green)
        const agentIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })

        const marker = L.marker([agentLocation.lat, agentLocation.lng], { icon: agentIcon })
            .addTo(mapInstance.current)
            .bindPopup("Agent en service")

        return () => {
            marker.remove()
        }
    }, [agentLocation])

    return <div ref={mapRef} className="w-full h-full" />
}
