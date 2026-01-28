import { db } from '@/lib/db'

export type ConflictResult = {
    hasConflict: boolean
    conflictingMission?: {
        id: string
        title: string
        startTime: Date
        endTime: Date
    }
}

/**
 * Checks if an agent has any conflicting missions during the specified time slot.
 * A conflict occurs if there is an overlap with another mission that is:
 * - Assigned to the same agent
 * - In an active status (ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS)
 * 
 * @param agentId The ID of the agent to check
 * @param startTime Start time of the new/updated mission
 * @param endTime End time of the new/updated mission
 * @param excludeMissionId Optional ID of the mission to exclude from check (e.g. self-update)
 */
export async function checkTimeSlotConflict(
    agentId: string,
    startTime: Date,
    endTime: Date,
    excludeMissionId?: string
): Promise<ConflictResult> {
    // Overlap logic: (StartA < EndB) and (EndA > StartB)
    const conflictingMission = await db.mission.findFirst({
        where: {
            agentId,
            status: {
                in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS']
            },
            id: excludeMissionId ? { not: excludeMissionId } : undefined,
            AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } }
            ]
        },
        select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true
        }
    })

    if (conflictingMission) {
        return {
            hasConflict: true,
            conflictingMission
        }
    }

    return { hasConflict: false }
}
