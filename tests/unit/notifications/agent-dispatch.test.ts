
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { sendPushToAll } from '@/lib/web-push'
import { findNearbyAgents } from '@/lib/redis-geo'
import { POST } from '@/app/api/missions/route'
import { NextResponse } from 'next/server'

// Mocks
vi.mock('@/lib/db', () => ({
    db: {
        company: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        mission: {
            create: vi.fn(),
        },
        pushSubscription: {
            findMany: vi.fn(),
        },
        user: {
            findMany: vi.fn(),
        },
        missionNotification: {
            create: vi.fn(),
        },
        agent: { findMany: vi.fn() }
    }
}))

vi.mock('@/lib/pusher', () => ({
    pusherServer: {
        trigger: vi.fn(),
    }
}))

vi.mock('@/lib/web-push', () => ({
    sendPushToAll: vi.fn(),
}))

vi.mock('@/lib/redis-geo', () => ({
    findNearbyAgents: vi.fn(),
    updateAgentLocation: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue({
        user: {
            id: 'company-user-id',
            role: 'COMPANY',
            isVerified: true,
            name: 'Test Company'
        }
    })
}))

vi.mock('@/lib/rate-limit', () => ({
    checkApiRateLimit: vi.fn().mockResolvedValue({ success: true })
}))

// Constants
const TARGET_AGENT_ID = 'target-user-id-123'
const MISSION_DATA = {
    title: 'Mission Test Notification',
    description: 'Une mission de test',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 172800000).toISOString(),
    location: '10 Rue de la République, Lyon, France',
    latitude: 45.764043,
    longitude: 4.835659,
}

describe('Agent Notification Dispatch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should send Pusher and WebPush notifications to the correct User ID', async () => {
        // 1. Setup Data
        // Mock Company
        vi.mocked(db.company.findUnique).mockResolvedValue({
            id: 'company-id',
            userId: 'company-user-id',
            companyName: 'Test Company',
        } as any)

        // Mock Mission Creation
        vi.mocked(db.mission.create).mockResolvedValue({
            id: 'new-mission-id',
            ...MISSION_DATA,
            startTime: new Date(MISSION_DATA.startTime),
            endTime: new Date(MISSION_DATA.endTime),
            status: 'PENDING',
            companyId: 'company-id'
        } as any)

        // 2. Setup "All Agents" - The Critical Part
        // Mock db.agent.findMany used in route.ts
        vi.mocked(db.agent.findMany).mockResolvedValue([
            { userId: TARGET_AGENT_ID }
        ] as any)

        // Mock User lookup
        vi.mocked(db.user.findMany).mockResolvedValue([
            { id: TARGET_AGENT_ID, email: 'agent@test.com' } as any
        ])

        // Mock Push Subscriptions for this agent
        vi.mocked(db.pushSubscription.findMany).mockResolvedValue([
            {
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                p256dh: 'test-key',
                auth: 'test-auth'
            } as any
        ])

        // 3. Execute Request
        const request = new Request('http://localhost:3000/api/missions', {
            method: 'POST',
            body: JSON.stringify(MISSION_DATA)
        })

        await POST(request)

        // 4. Verify PUSHER Notification
        // Expect trigger on 'private-user-[TARGET_AGENT_ID]'
        expect(pusherServer.trigger).toHaveBeenCalledWith(
            `private-user-${TARGET_AGENT_ID}`, // Channel
            'mission:new',                     // Event
            expect.objectContaining({          // Data
                title: MISSION_DATA.title,
                companyName: 'Test Company',
                link: `/agent/dashboard` // Verify link format
            })
        )
        // Also verify public feed verification (optional)
        expect(pusherServer.trigger).toHaveBeenCalledWith(
            'public-missions',
            'mission:created',
            expect.anything()
        )

        // 5. Verify WEB PUSH Notification
        // Since logic batches them, checks if sendPushToAll is called
        expect(sendPushToAll).toHaveBeenCalled()

        // 6. Verify Database Notification (REMOVED IN MVP)
        // expect(db.missionNotification.create).toHaveBeenCalledWith(...)

        console.log('✅ Notification logic verified: Events sent to', TARGET_AGENT_ID)
    })
})
