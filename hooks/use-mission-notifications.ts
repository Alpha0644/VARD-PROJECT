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
            // Simple 'Beep' sound (Base 64 to avoid file issues)
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
            audio.play().catch(e => console.log('Audio autoplay blocked', e))

            toast.success('Nouvelle mission disponible !', {
                description: `${data.companyName} à ${data.location}`,
                position: 'top-center', // Force visibility at top
                duration: 8000,
                action: {
                    label: 'Voir',
                    onClick: () => router.push(data.link)
                },
                style: {
                    background: '#10B981', // Green background
                    color: 'white',
                    border: 'none'
                }
            })

            // Refresh the page data to show the new mission in the list
            router.refresh()
        })

        return () => {
            pusherClient.unsubscribe(channelName)
        }
    }, [userId, router])
}
