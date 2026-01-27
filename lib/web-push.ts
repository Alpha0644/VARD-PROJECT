import webpush from 'web-push'

// VAPID keys - Generated for VARD Push Notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@vard.fr'

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    )
}

export interface PushPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: Record<string, unknown>
}

export interface PushSubscriptionData {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<boolean> {
    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: subscription.keys
            },
            JSON.stringify(payload)
        )
        return true
    } catch (error) {
        console.error('Push notification failed:', error)
        return false
    }
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendPushToAll(
    subscriptions: PushSubscriptionData[],
    payload: PushPayload
): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
        subscriptions.map(sub => sendPushNotification(sub, payload))
    )

    const success = results.filter(r => r.status === 'fulfilled' && r.value).length
    const failed = results.length - success

    return { success, failed }
}

export { webpush, VAPID_PUBLIC_KEY }
