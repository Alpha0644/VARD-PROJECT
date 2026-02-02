/**
 * OMEGA Protocol v3.0 - Mission Creation API Tests
 * Coverage Target: 85% (Business Logic Critical Path)
 * Test Strategy: Unit Testing with Mocked Dependencies
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/missions/route'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { findNearbyAgents } from '@/lib/redis-geo'
import { checkApiRateLimit } from '@/lib/rate-limit'

// Mock dependencies
import { vi } from 'vitest'

// Safe future dates for testing
const FUTURE_START = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
const FUTURE_END = new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString() // Tomorrow + 8h

// Correctly mock next/server Response objects
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: (body: any, init?: any) => ({
                status: init?.status || 200,
                json: async () => body,
            }),
        },
    }
})

// Mock auth before imports
vi.mock('@/lib/auth', () => ({
    auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
    db: {
        company: { findUnique: vi.fn(), create: vi.fn() },
        mission: { create: vi.fn() },
        missionNotification: { create: vi.fn() },
        user: {
            findMany: vi.fn().mockResolvedValue([
                { id: 'agent-1', email: 'agent1@test.com' },
                { id: 'agent-2', email: 'agent2@test.com' },
                { id: 'agent-3', email: 'agent3@test.com' }
            ])
        },
        pushSubscription: { findMany: vi.fn().mockResolvedValue([]) },
    }
}))

vi.mock('@/lib/redis-geo', () => ({
    findNearbyAgents: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/rate-limit', () => ({
    checkApiRateLimit: vi.fn(),
}))

vi.mock('@/lib/pusher', () => ({
    pusherServer: {
        trigger: vi.fn().mockResolvedValue(undefined),
    },
}))

vi.mock('@/lib/web-push', () => ({
    sendPushToAll: vi.fn().mockResolvedValue(undefined),
}))

describe('POST /api/missions', () => {
    const mockCompany = {
        id: 'company-123',
        userId: 'user-123',
        companyName: 'Test Security Agency',
        siren: '123456789',
    }

    const mockMission = {
        id: 'mission-123',
        title: 'Gardiennage chantier',
        description: 'Mission de sécurité',
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        location: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        status: 'PENDING',
        companyId: 'company-123',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('✅ Happy Path', () => {
        it('creates mission successfully with verified company', async () => {
            // Arrange: Mock valid session
            vi.mocked(auth).mockResolvedValue({
                user: {
                    id: 'user-123',
                    role: 'COMPANY',
                    isVerified: true,
                },
            } as any)

            // Mock rate limit success
            vi.mocked(checkApiRateLimit).mockResolvedValue({
                success: true,
                limit: 20,
                remaining: 19,
                reset: Date.now() + 60000,
            })

            // Mock company exists
            vi.mocked(db.company.findUnique).mockResolvedValue(mockCompany as any)

            // Mock mission creation
            vi.mocked(db.mission.create).mockResolvedValue(mockMission as any)

            // Mock nearby agents
            vi.mocked(findNearbyAgents).mockResolvedValue(['agent-1', 'agent-2'])

            // Mock notification creation
            vi.mocked(db.missionNotification.create).mockResolvedValue({} as any)

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Gardiennage chantier',
                    description: 'Mission de sécurité',
                    startTime: FUTURE_START,
                    endTime: FUTURE_END,
                    location: 'Paris',
                    latitude: 48.8566,
                    longitude: 2.3522,
                }),
            })

            // Act
            const response = await POST(request)
            const data = await response.json()

            // Assert
            expect(response.status).toBe(200)
            expect(data.mission).toBeDefined()
            expect(data.notifiedCount).toBe(2)
            expect(db.mission.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        title: 'Gardiennage chantier',
                        status: 'PENDING',
                    }),
                })
            )
        })

        it('notifies nearby agents within 10km radius', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-123', role: 'COMPANY', isVerified: true },
            } as any)

            vi.mocked(checkApiRateLimit).mockResolvedValue({
                success: true,
                limit: 20,
                remaining: 19,
                reset: Date.now(),
            })

            vi.mocked(db.company.findUnique).mockResolvedValue(mockCompany as any)
            vi.mocked(db.mission.create).mockResolvedValue(mockMission as any)
            vi.mocked(findNearbyAgents).mockResolvedValue(['agent-1', 'agent-2', 'agent-3'])
            vi.mocked(db.missionNotification.create).mockResolvedValue({} as any)

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Mission',
                    startTime: FUTURE_START,
                    endTime: FUTURE_END,
                    location: 'Lyon, France',
                    latitude: 45.764,
                    longitude: 4.8357,
                }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(findNearbyAgents).toHaveBeenCalledWith(45.764, 4.8357, 10)
            expect(data.notifiedCount).toBe(3)
            expect(db.missionNotification.create).toHaveBeenCalledTimes(3)
        })
    })

    describe('❌ Error Handling', () => {
        it('returns 401 if not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null as any)

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)

            expect(response.status).toBe(401)
            expect(await response.json()).toEqual({ error: 'Non autorisé' })
        })

        it('returns 401 if user is not COMPANY role', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT', isVerified: true },
            } as any)

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)

            expect(response.status).toBe(401)
            expect(await response.json()).toEqual({ error: 'Non autorisé' })
        })

        it('returns 403 if company is not verified', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-123', role: 'COMPANY', isVerified: false },
            } as any)

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)

            expect(response.status).toBe(403)
            expect(await response.json()).toEqual({ error: 'Compte non vérifié' })
        })

        it('returns 429 if rate limit exceeded', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-123', role: 'COMPANY', isVerified: true },
            } as any)

            vi.mocked(checkApiRateLimit).mockResolvedValue({
                success: false,
                limit: 20,
                remaining: 0,
                reset: Date.now() + 60000,
            })

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)

            expect(response.status).toBe(429)
            const data = await response.json()
            expect(data.error).toBe('Trop de requêtes')
        })

        it('returns 400 on validation error', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-123', role: 'COMPANY', isVerified: true },
            } as any)

            vi.mocked(checkApiRateLimit).mockResolvedValue({
                success: true,
                limit: 20,
                remaining: 19,
                reset: Date.now(),
            })

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test', // Too short (min 5 chars)
                }),
            })

            const response = await POST(request)

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('Données invalides')
            expect(data.details).toBeDefined()
        })
    })

    describe('🏢 Company Profile Handling', () => {
        it('creates company profile if missing (lazy creation)', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: {
                    id: 'user-new',
                    name: 'New Company',
                    role: 'COMPANY',
                    isVerified: true,
                },
            } as any)

            vi.mocked(checkApiRateLimit).mockResolvedValue({ success: true } as any)

            // Company doesn't exist yet
            vi.mocked(db.company.findUnique).mockResolvedValue(null)

            // Mock company creation
            vi.mocked(db.company.create).mockResolvedValue({
                id: 'company-new',
                userId: 'user-new',
                companyName: 'New Company',
                siren: 'PENDING-12345',
            } as any)

            vi.mocked(db.mission.create).mockResolvedValue(mockMission as any)
            vi.mocked(findNearbyAgents).mockResolvedValue([])

            const request = new Request('http://localhost:3000/api/missions', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Mission',
                    startTime: FUTURE_START,
                    endTime: FUTURE_END,
                    location: 'Paris',
                    latitude: 48.8566,
                    longitude: 2.3522,
                }),
            })

            const response = await POST(request)

            expect(response.status).toBe(200)
            expect(db.company.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user-new',
                        companyName: 'New Company',
                    }),
                })
            )
        })
    })
})
