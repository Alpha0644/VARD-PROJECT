'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

// Fix generic Leaflet icon issue in Next.js
const icon = L.icon({
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

export function AgentMap() {
    const [isMounted, setIsMounted] = useState(false)
    const [position, setPosition] = useState<[number, number] | null>(null)

    useEffect(() => {
        setIsMounted(true)
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude])
            })
        }
    }, [])

    if (!isMounted) return <div className="h-full w-full bg-gray-900 flex items-center justify-center text-white">Chargement de la carte...</div>

    // Paris default center if no position yet
    const center: [number, number] = position || [48.8566, 2.3522]

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            {/* Dark Mode Tiles (CartoDB Dark Matter) */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* User Marker */}
            {position && (
                <Marker position={position} icon={icon}>
                    <Popup>
                        Vous êtes ici.
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    )
}
