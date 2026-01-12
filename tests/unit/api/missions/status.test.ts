/**
 * OMEGA Protocol v3.0 - Mission Status Update API Tests
 * Coverage Target: 85% (Business Logic Critical Path)
 * Test Strategy: Unit Testing with Authorization Focus
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PATCH } from '@/app/api/missions/[id]/status/route'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/db')
vi.mock('@/lib/auth')

describe('PATCH /api/missions/[id]/status', () => {
    const mockAgent = {
        id: 'agent-123',
        userId: 'user-agent',
        cartePro: 'CNAPS123',
        carteProExp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        latitude: 48.8566,
        longitude: 2.3522,
    }

    const mockMission = {
        id: 'mission-123',
        title: 'Gardiennage',
        status: 'ACCEPTED',
        agentId: 'agent-123',
        companyId: 'company-123',
        latitude: 48.8566,
        longitude: 2.3522,
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        location: 'Paris',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('✅ Happy Path', () => {
        it('updates mission status successfully', async () => {
            // Arrange
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)
            vi.mocked(db.mission.findUnique).mockResolvedValue(mockMission as any)

            const updatedMission = { ...mockMission, status: 'IN_PROGRESS' }
            vi.mocked(db.mission.update).mockResolvedValue(updatedMission as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }

            // Act
            const response = await PATCH(request, props)
            const data = await response.json()

            // Assert
            expect(response.status).toBe(200)
            expect(data.status).toBe('IN_PROGRESS')
            expect(db.mission.update).toHaveBeenCalledWith({
                where: { id: 'mission-123' },
                data: expect.objectContaining({
                    status: 'IN_PROGRESS',
                }),
            })
        })

        it('updates mission status with geolocation', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)
            vi.mocked(db.mission.findUnique).mockResolvedValue(mockMission as any)
            vi.mocked(db.mission.update).mockResolvedValue({
                ...mockMission,
                status: 'ARRIVED',
                latitude: 48.85,
                longitude: 2.35,
            } as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({
                    status: 'ARRIVED',
                    latitude: 48.85,
                    longitude: 2.35,
                }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }

            const response = await PATCH(request, props)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(db.mission.update).toHaveBeenCalledWith({
                where: { id: 'mission-123' },
                data: expect.objectContaining({
                    status: 'ARRIVED',
                    latitude: 48.85,
                    longitude: 2.35,
                }),
            })
        })

        it('allows all valid status transitions', async () => {
            const validStatuses = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)
            vi.mocked(db.mission.findUnique).mockResolvedValue(mockMission as any)

            for (const status of validStatuses) {
                vi.mocked(db.mission.update).mockResolvedValue({
                    ...mockMission,
                    status,
                } as any)

                const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                })

                const props = { params: Promise.resolve({ id: 'mission-123' }) }
                const response = await PATCH(request, props)

                expect(response.status).toBe(200)
            }
        })
    })

    describe('❌ Error Handling', () => {
        it('returns 401 if not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(401)
            expect(await response.json()).toEqual({ error: 'Non autorisé' })
        })

        it('returns 401 if user is not AGENT role', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-company', role: 'COMPANY' },
            } as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(401)
            expect(await response.json()).toEqual({ error: 'Non autorisé' })
        })

        it('returns 404 if agent profile does not exist', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(null)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(404)
            expect(await response.json()).toEqual({ error: 'Profil agent introuvable' })
        })

        it('returns 404 if mission does not exist', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)
            vi.mocked(db.mission.findUnique).mockResolvedValue(null)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(404)
            expect(await response.json()).toEqual({ error: 'Mission introuvable' })
        })

        it('returns 403 if agent tries to update mission not assigned to them (IDOR protection)', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            // Agent exists
            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)

            // Mission exists but assigned to different agent
            vi.mocked(db.mission.findUnique).mockResolvedValue({
                ...mockMission,
                agentId: 'different-agent-id', // Not mockAgent.id
            } as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(403)
            expect(await response.json()).toEqual({
                error: 'Mission non attribuée à cet agent',
            })
        })

        it('returns 400 on invalid status value', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent', role: 'AGENT' },
            } as any)

            vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'INVALID_STATUS' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(400)
            expect(await response.json()).toEqual({ error: 'Données invalides' })
        })
    })

    describe('🔐 Security - IDOR Protection', () => {
        it('prevents agent from updating other agents missions', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: 'user-agent-1', role: 'AGENT' },
            } as any)

            const agent1 = { ...mockAgent, id: 'agent-1', userId: 'user-agent-1' }
            vi.mocked(db.agent.findUnique).mockResolvedValue(agent1 as any)

            // Mission belongs to agent-2, not agent-1
            const missionForAgent2 = { ...mockMission, agentId: 'agent-2' }
            vi.mocked(db.mission.findUnique).mockResolvedValue(missionForAgent2 as any)

            const request = new Request('http://localhost:3000/api/missions/mission-123/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'COMPLETED' }),
            })

            const props = { params: Promise.resolve({ id: 'mission-123' }) }
            const response = await PATCH(request, props)

            expect(response.status).toBe(403)
            expect(db.mission.update).not.toHaveBeenCalled()
        })
    })
})
