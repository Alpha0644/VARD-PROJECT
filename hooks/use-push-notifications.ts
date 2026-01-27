'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
    isSupported: boolean
    isSubscribed: boolean
    isLoading: boolean
    permission: NotificationPermission | 'default'
    subscribe: () => Promise<boolean>
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

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!registration || !VAPID_PUBLIC_KEY) {
            console.error('Missing registration or VAPID key')
            return false
        }

        setIsLoading(true)

        try {
            // Request permission
            const perm = await Notification.requestPermission()
            setPermission(perm)

            if (perm !== 'granted') {
                setIsLoading(false)
                return false
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

            if (response.ok) {
                setIsSubscribed(true)
                setIsLoading(false)
                return true
            }

            // If server save failed, unsubscribe
            await subscription.unsubscribe()
            setIsLoading(false)
            return false

        } catch (error) {
            console.error('Subscribe error:', error)
            setIsLoading(false)
            return false
        }
    }, [registration])

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!registration) return false

        setIsLoading(true)

        try {
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                // Unsubscribe from server
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                })

                // Unsubscribe locally
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
