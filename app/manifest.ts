import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VARD - Sécurité Privée',
        short_name: 'VARD',
        description: 'Plateforme de gestion de missions de sécurité privée',
        start_url: '/',
        display: 'standalone',
        background_color: '#0A1628',
        theme_color: '#0A1628',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
