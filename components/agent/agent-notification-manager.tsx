
'use client'

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// ─── Types (OMEGA: No `any`) ──────────────────────────────────────

interface MissionNewEvent {
    missionId: string
    title: string
    location: string
    link?: string
}

interface MissionCancelledEvent {
    id: string
    title: string
}

// ─── Component ────────────────────────────────────────────────────

export function AgentNotificationManager({ userId }: { userId: string }) {
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        // 1. Pusher Subscription (Foreground — works everywhere)
        const channelName = `private-user-${userId}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind('mission:new', (data: MissionNewEvent) => {
            // Toast Notification
            toast.message('Nouvelle Mission !', {
                description: `${data.title} à ${data.location}`,
                action: {
                    label: 'Voir',
                    onClick: () => router.push(data.link || '/agent/dashboard')
                },
                duration: 10000,
            })

            // Refresh data
            router.refresh()

            // Vibration
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
            }
        })

        channel.bind('mission:cancelled', (data: MissionCancelledEvent) => {
            toast.error('Mission Annulée', {
                description: `La mission "${data.title}" a été annulée.`
            })
            router.refresh()
        })

        return () => {
            pusherClient.unsubscribe(channelName)
            pusherClient.unbind_all()
        }
    }, [userId, router])

    return null // Logic-only component
}
