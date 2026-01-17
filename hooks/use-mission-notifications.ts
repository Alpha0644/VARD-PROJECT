"use client"

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface MissionEvent {
    id: string
    title: string
    location: string
    companyName: string
    startTime: string
    link: string
}

export function useMissionNotifications(userId: string) {
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        const channelName = `private-user-${userId}`
        const channel = pusherClient.subscribe(channelName)

        channel.bind('mission:new', (data: MissionEvent) => {
            // Play sound (optional)
            const audio = new Audio('/sounds/notification.mp3') // We need to add this file or remove this line
            audio.play().catch(e => console.log('Audio play failed', e))

            toast.message('Nouvelle mission disponible !', {
                description: `${data.companyName} à ${data.location}`,
                action: {
                    label: 'Voir',
                    onClick: () => router.push(data.link)
                },
                duration: 10000, // 10 seconds
            })

            // Refresh the page data to show the new mission in the list
            router.refresh()
        })

        return () => {
            pusherClient.unsubscribe(channelName)
        }
    }, [userId, router])
}
