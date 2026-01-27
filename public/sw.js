// VARD Service Worker for Push Notifications
// This file MUST be in /public folder

const CACHE_NAME = 'vard-v1'

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...')
    self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Service worker activated')
    event.waitUntil(self.clients.claim())
})

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event)

    let data = {
        title: 'VARD',
        body: 'Nouvelle notification',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'vard-notification',
        data: {}
    }

    try {
        if (event.data) {
            const payload = event.data.json()
            data = { ...data, ...payload }
        }
    } catch (e) {
        console.error('[SW] Error parsing push data:', e)
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/badge-72.png',
        tag: data.tag,
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            { action: 'open', title: 'Voir' },
            { action: 'dismiss', title: 'Ignorer' }
        ],
        requireInteraction: true
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action)

    event.notification.close()

    if (event.action === 'dismiss') {
        return
    }

    // Open the app on notification click
    const urlToOpen = event.notification.data?.url || '/agent/dashboard'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes('/agent') && 'focus' in client) {
                        return client.focus()
                    }
                }
                // Open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen)
                }
            })
    )
})
