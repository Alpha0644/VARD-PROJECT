
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkTimeSlotConflict } from '@/lib/mission-service'
import { db } from '@/lib/db'

// Mock the db client
vi.mock('@/lib/db', () => ({
    db: {
        mission: {
            findFirst: vi.fn()
        }
    }
}))

describe('Mission Service - Double Booking Prevention', () => {
    const agentId = 'agent-123'
    const baseTime = new Date('2026-01-30T10:00:00Z')

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return no conflict when checking a free slot', async () => {
        // Mock DB returning null (no conflict found)
        vi.mocked(db.mission.findFirst).mockResolvedValue(null)

        const start = new Date(baseTime)
        const end = new Date(baseTime.getTime() + 3600000) // +1h

        const result = await checkTimeSlotConflict(agentId, start, end)

        expect(result.hasConflict).toBe(false)
        expect(result.conflictingMission).toBeUndefined()

        // precise verify arguments
        expect(db.mission.findFirst).toHaveBeenCalledWith({
            where: {
                agentId,
                status: {
                    in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS']
                },
                id: undefined,
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            },
            select: expect.any(Object)
        })
    })

    it('should detect a conflict when mission exists in slot', async () => {
        const conflictMission = {
            id: 'mission-conflict',
            title: 'Existing Mission',
            startTime: baseTime,
            endTime: new Date(baseTime.getTime() + 3600000)
        }

        // Mock DB returning a mission
        vi.mocked(db.mission.findFirst).mockResolvedValue(conflictMission as any)

        const result = await checkTimeSlotConflict(agentId, baseTime, conflictMission.endTime)

        expect(result.hasConflict).toBe(true)
        expect(result.conflictingMission).toEqual(conflictMission)
    })

    it('should exclude specific mission ID from check (self-update)', async () => {
        vi.mocked(db.mission.findFirst).mockResolvedValue(null)

        const excludeId = 'mission-self'
        await checkTimeSlotConflict(agentId, baseTime, baseTime, excludeId)

        expect(db.mission.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                id: { not: excludeId }
            })
        }))
    })
})
