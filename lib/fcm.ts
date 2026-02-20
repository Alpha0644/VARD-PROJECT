/**
 * Firebase Cloud Messaging (FCM) — Admin SDK (V1)
 * 
 * Sends native push notifications to Android/iOS devices.
 * 
 * SECURITY: Uses environment variables from .env instead of a JSON file.
 * No sensitive file to accidentally commit.
 * 
 * Required .env variables:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

import * as admin from 'firebase-admin'
import { db } from '@/lib/db'

// ─── Initialization (from .env, NOT from a JSON file) ─────────────

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') // Fix escaped newlines

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            })
        })
    } else {
        console.warn('[FCM] Missing Firebase env variables. Push notifications disabled.')
    }
}

// ─── Types ────────────────────────────────────────────────────────

interface FCMNotificationPayload {
    title: string
    body: string
    icon?: string
    tag?: string
    data?: Record<string, string>
}

// ─── Core Functions ───────────────────────────────────────────────

/**
 * Send a push notification to a single FCM token
 */
export async function sendFCMNotification(
    token: string,
    payload: FCMNotificationPayload
): Promise<boolean> {
    if (!admin.apps.length) {
        console.error('[FCM] Firebase Admin not initialized')
        return false
    }

    try {
        await admin.messaging().send({
            token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            android: {
                priority: 'high',
                notification: {
                    channelId: 'vard-missions',
                    icon: payload.icon || 'ic_notification',
                    color: '#1a56db', // Couleur principale (bleu VARD)
                    tag: payload.tag,
                    sound: 'default',
                    defaultVibrateTimings: true,
                    defaultLightSettings: true,
                    visibility: 'public',
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                        contentAvailable: true,
                    }
                }
            }
        })

        return true
    } catch (error: unknown) {
        const fcmError = error as { code?: string }
        console.error('[FCM] Send failed:', error)

        // Clean up invalid tokens automatically
        if (fcmError.code === 'messaging/registration-token-not-registered' ||
            fcmError.code === 'messaging/invalid-registration-token') {
            await db.pushSubscription.deleteMany({
                where: { fcmToken: token }
            })
        }

        return false
    }
}

/**
 * Send a push notification to ALL devices of a specific user
 * Handles both Web Push and FCM automatically
 */
export async function sendNotificationToUser(
    userId: string,
    payload: FCMNotificationPayload
): Promise<{ webSuccess: number; fcmSuccess: number; failed: number }> {
    const subscriptions = await db.pushSubscription.findMany({
        where: { userId }
    })

    let webSuccess = 0
    let fcmSuccess = 0
    let failed = 0

    for (const sub of subscriptions) {
        if (sub.platform === 'web' && sub.p256dh && sub.auth) {
            try {
                const { sendPushNotification } = await import('@/lib/web-push')
                const success = await sendPushNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                )
                if (success) webSuccess++
                else failed++
            } catch {
                failed++
            }
        } else if (sub.fcmToken) {
            const success = await sendFCMNotification(sub.fcmToken, payload)
            if (success) fcmSuccess++
            else failed++
        }
    }

    return { webSuccess, fcmSuccess, failed }
}

/**
 * Send a notification to ALL subscribed users (broadcast)
 */
export async function broadcastToAllAgents(
    payload: FCMNotificationPayload
): Promise<{ total: number; success: number; failed: number }> {
    const subscriptions = await db.pushSubscription.findMany()

    let success = 0
    let failed = 0

    for (const sub of subscriptions) {
        if (sub.fcmToken) {
            const ok = await sendFCMNotification(sub.fcmToken, payload)
            if (ok) success++
            else failed++
        } else if (sub.p256dh && sub.auth) {
            try {
                const { sendPushNotification } = await import('@/lib/web-push')
                const ok = await sendPushNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                )
                if (ok) success++
                else failed++
            } catch {
                failed++
            }
        }
    }

    return { total: subscriptions.length, success, failed }
}
