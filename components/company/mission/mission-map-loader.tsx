'use client'

import dynamic from 'next/dynamic'

export const MissionMapLoader = dynamic(
    () => import('@/components/company/mission/mission-map').then((mod) => mod.MissionMap),
    {
        ssr: false,
        loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />,
    }
)
