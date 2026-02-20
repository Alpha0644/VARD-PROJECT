'use client'

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

// ─── Types ────────────────────────────────────────────────────────

interface UsePushNotificationsReturn {
    isSupported: boolean
    isSubscribed: boolean
    isLoading: boolean
    permission: NotificationPermission | 'default'
    subscribe: () => Promise<void>
    unsubscribe: () => Promise<boolean>
}

// ─── Constants ────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY

// ─── Utilities ────────────────────────────────────────────────────

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

// ─── Hook ─────────────────────────────────────────────────────────

export function usePushNotifications(): UsePushNotificationsReturn {
    const [isSupported, setIsSupported] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    // ─── Detect Platform & Check Support ──────────────────────
    useEffect(() => {
        const checkSupport = async () => {
            if (Capacitor.isNativePlatform()) {
                // ── Native (Android/iOS) ──
                // Push notifications are ALWAYS supported natively
                setIsSupported(true)

                try {
                    const { PushNotifications } = await import('@capacitor/push-notifications')
                    const permStatus = await PushNotifications.checkPermissions()

                    if (permStatus.receive === 'granted') {
                        setPermission('granted')
                        setIsSubscribed(true) // Assume subscribed if permission granted
                    }
                } catch (error) {
                    console.warn('[Push] Native check failed:', error)
                }

                setIsLoading(false)
                return
            }

            // ── Web (Browser) ──
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
                const reg = await navigator.serviceWorker.register('/sw.js')
                setRegistration(reg)

                const subscription = await reg.pushManager.getSubscription()
                setIsSubscribed(!!subscription)
            } catch (error) {
                console.error('[Push] Service worker registration failed:', error)
            }

            setIsLoading(false)
        }

        checkSupport()
    }, [])

    // ─── Subscribe ────────────────────────────────────────────
    const subscribe = useCallback(async (): Promise<void> => {
        setIsLoading(true)

        try {
            if (Capacitor.isNativePlatform()) {
                // ── Native FCM Subscribe ──
                const { PushNotifications } = await import('@capacitor/push-notifications')

                // 1. Request permission (Android 13+ popup)
                const permResult = await PushNotifications.requestPermissions()
                if (permResult.receive !== 'granted') {
                    setIsLoading(false)
                    throw new Error('Permission de notification refusée')
                }

                setPermission('granted')

                // 2. Create notification channel (Android)
                await PushNotifications.createChannel({
                    id: 'vard-missions',
                    name: 'Missions VARD',
                    description: 'Notifications de nouvelles missions et mises à jour',
                    importance: 5, // MAX — heads-up + sound + vibration
                    visibility: 1, // PUBLIC — visible on lock screen
                    vibration: true,
                    sound: 'default',
                })

                // 3. Register for push (triggers 'registration' event)
                await PushNotifications.register()

                // 4. Listen for the FCM token
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('FCM registration timeout (10s)'))
                    }, 10000)

                    PushNotifications.addListener('registration', async (token) => {
                        clearTimeout(timeout)

                        // 5. Send token to our backend
                        const response = await fetch('/api/push/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fcmToken: token.value,
                                platform: 'android'
                            })
                        })

                        if (!response.ok) {
                            reject(new Error('Échec sauvegarde token FCM'))
                            return
                        }

                        setIsSubscribed(true)
                        resolve()
                    })

                    PushNotifications.addListener('registrationError', (error) => {
                        clearTimeout(timeout)
                        reject(new Error(`FCM registration error: ${error.error}`))
                    })
                })

                // 6. Handle foreground notifications
                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    // Notification received while app is in foreground
                    // Pusher toasts already handle this, but we log for debug
                    console.info('[Push] Foreground notification:', notification.title)
                })

                // 7. Handle notification tap (deep link)
                PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                    const data = action.notification.data
                    if (data?.url) {
                        window.location.href = data.url
                    } else if (data?.missionId) {
                        window.location.href = `/agent/missions/${data.missionId}`
                    } else {
                        window.location.href = '/agent/dashboard'
                    }
                })

            } else {
                // ── Web Push Subscribe ──
                if (!registration) {
                    throw new Error('Service Worker not registered')
                }
                if (!VAPID_PUBLIC_KEY) {
                    throw new Error('Missing VAPID Key')
                }

                const perm = await Notification.requestPermission()
                setPermission(perm)

                if (perm !== 'granted') {
                    setIsLoading(false)
                    throw new Error('Permission denied by user')
                }

                const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey as BufferSource
                })

                const response = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription.toJSON())
                })

                if (!response.ok) {
                    throw new Error('Failed to save subscription to server')
                }

                setIsSubscribed(true)
            }
        } catch (error) {
            console.error('[Push] Subscribe error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [registration])

    // ─── Unsubscribe ──────────────────────────────────────────
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        setIsLoading(true)
        try {
            if (Capacitor.isNativePlatform()) {
                const { PushNotifications } = await import('@capacitor/push-notifications')
                await PushNotifications.unregister()
                // Note: Backend cleanup happens when token becomes invalid
            } else {
                if (!registration) return false

                const subscription = await registration.pushManager.getSubscription()
                if (subscription) {
                    await fetch('/api/push/subscribe', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: subscription.endpoint })
                    })
                    await subscription.unsubscribe()
                }
            }

            setIsSubscribed(false)
            return true
        } catch (error) {
            console.error('[Push] Unsubscribe error:', error)
            return false
        } finally {
            setIsLoading(false)
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
