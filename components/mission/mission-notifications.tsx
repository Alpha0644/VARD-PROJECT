"use client"

import { useMissionNotifications } from '@/hooks/use-mission-notifications'

export function MissionNotifications({ userId }: { userId: string }) {
    useMissionNotifications(userId)
    return null
}
