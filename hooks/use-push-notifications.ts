'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
    isSupported: boolean
    isSubscribed: boolean
    isLoading: boolean
    permission: NotificationPermission | 'default'
    subscribe: () => Promise<void>
    unsubscribe: () => Promise<boolean>
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [isSupported, setIsSupported] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    // Check support and current state
    useEffect(() => {
        const checkSupport = async () => {
            const supported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window

            setIsSupported(supported)

            if (!supported) {
                setIsLoading(false)
                return
            }

            setPermission(Notification.permission)

            try {
                // Register service worker
                const reg = await navigator.serviceWorker.register('/sw.js')
                setRegistration(reg)

                // Check existing subscription
                const subscription = await reg.pushManager.getSubscription()
                setIsSubscribed(!!subscription)
            } catch (error) {
                console.error('Service worker registration failed:', error)
            }

            setIsLoading(false)
        }

        checkSupport()
    }, [])

    const subscribe = useCallback(async (): Promise<void> => {
        if (!registration) {
            throw new Error('Service Worker not registered')
        }
        if (!VAPID_PUBLIC_KEY) {
            throw new Error('Configuration Warning: Missing VAPID Key. Please check environment variables.')
        }

        setIsLoading(true)

        try {
            // Request permission
            const perm = await Notification.requestPermission()
            setPermission(perm)

            if (perm !== 'granted') {
                setIsLoading(false)
                throw new Error('Permission denied by user')
            }

            // Subscribe to push
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource
            })

            // Send subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription.toJSON())
            })

            if (!response.ok) {
                throw new Error('Failed to save subscription to server')
            }

            setIsSubscribed(true)
            setIsLoading(false)

        } catch (error) {
            console.error('Subscribe error:', error)
            setIsLoading(false)
            throw error // Re-throw for UI to handle
        }
    }, [registration])

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        // ... unchanged unsubscribe logic ...
        if (!registration) return false
        setIsLoading(true)
        try {
            const subscription = await registration.pushManager.getSubscription()
            if (subscription) {
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                })
                await subscription.unsubscribe()
            }
            setIsSubscribed(false)
            setIsLoading(false)
            return true
        } catch (error) {
            console.error('Unsubscribe error:', error)
            setIsLoading(false)
            return false
        }
    }, [registration])

    return {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        subscribe,
        unsubscribe
    }
}
