import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/missions/history/route'
import { db } from '@/lib/db'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
    auth: vi.fn()
}))

vi.mock('@/lib/db', () => ({
    db: {
        mission: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        agent: {
            findUnique: vi.fn(),
        },
        company: {
            findUnique: vi.fn(),
        }
    }
}))

import { auth } from '@/lib/auth'

describe('GET /api/missions/history', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null)
        const req = new Request('http://localhost/api/missions/history')
        const res = await GET(req)

        expect(res.status).toBe(401)
    })

    it('returns missions for AGENT', async () => {
        // Mock Auth
        (auth as any).mockResolvedValue({
            user: { id: 'user-agent-123', role: 'AGENT' }
        })

        // Mock Agent Profile
        const mockAgent = { id: 'agent-profile-123' }
            ; (db.agent.findUnique as any).mockResolvedValue(mockAgent)

        // Mock Missions
        const mockMissions = [{ id: 'mission-1', title: 'Mission Test' }]
            ; (db.mission.findMany as any).mockResolvedValue(mockMissions)
            ; (db.mission.count as any).mockResolvedValue(1)

        const req = new Request('http://localhost/api/missions/history?limit=10')
        const res = await GET(req)
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.data).toHaveLength(1)

        // Verify db call used correct agentId filter
        expect(db.mission.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                agentId: mockAgent.id,
                status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] }
            })
        }))
    })

    it('returns missions for COMPANY', async () => {
        // Mock Auth
        (auth as any).mockResolvedValue({
            user: { id: 'user-company-123', role: 'COMPANY' }
        })

        // Mock Company Profile
        const mockCompany = { id: 'company-profile-123' }
            ; (db.company.findUnique as any).mockResolvedValue(mockCompany)

            // Mock Missions
            ; (db.mission.findMany as any).mockResolvedValue([])
            ; (db.mission.count as any).mockResolvedValue(0)

        const req = new Request('http://localhost/api/missions/history')
        await GET(req)

        // Verify db call used correct companyId filter
        expect(db.mission.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                companyId: mockCompany.id
            })
        }))
    })

    it('validates pagination params', async () => {
        (auth as any).mockResolvedValue({ user: { role: 'AGENT' } })

        const req = new Request('http://localhost/api/missions/history?limit=999') // Too high
        const res = await GET(req)

        expect(res.status).toBe(400) // Zod validation error
    })
})
