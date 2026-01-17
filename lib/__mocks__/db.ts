/**
 * Prisma Client Mock for Vitest
 * Auto-loaded when vi.mock('@/lib/db') is called
 */
import { vi } from 'vitest'

// Mock function type helper
type MockFn = ReturnType<typeof vi.fn>

// Create mock functions that can be spied on
const mockUser = {
    findUnique: vi.fn() as MockFn,
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
    delete: vi.fn() as MockFn,
    count: vi.fn() as MockFn,
}

const mockAgent = {
    findUnique: vi.fn() as MockFn,
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
}

const mockCompany = {
    findUnique: vi.fn() as MockFn,
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
    upsert: vi.fn() as MockFn,
}

const mockMission = {
    findUnique: vi.fn() as MockFn,
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
    count: vi.fn() as MockFn,
}

const mockDocument = {
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
    updateMany: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
}

const mockMissionNotification = {
    findMany: vi.fn() as MockFn,
    findFirst: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    update: vi.fn() as MockFn,
    delete: vi.fn() as MockFn,
}

const mockMissionLog = {
    findMany: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
}

const mockVerificationToken = {
    findUnique: vi.fn() as MockFn,
    create: vi.fn() as MockFn,
    delete: vi.fn() as MockFn,
}

// Define db type explicitly to avoid circular reference
interface MockDb {
    user: typeof mockUser
    agent: typeof mockAgent
    company: typeof mockCompany
    mission: typeof mockMission
    document: typeof mockDocument
    missionNotification: typeof mockMissionNotification
    missionLog: typeof mockMissionLog
    verificationToken: typeof mockVerificationToken
    $transaction: MockFn
}

export const db: MockDb = {
    user: mockUser,
    agent: mockAgent,
    company: mockCompany,
    mission: mockMission,
    document: mockDocument,
    missionNotification: mockMissionNotification,
    missionLog: mockMissionLog,
    verificationToken: mockVerificationToken,
    $transaction: vi.fn((fn) => fn(db)),
}

// Reset all mocks between tests
export function resetDbMocks(): void {
    Object.values(mockUser).forEach(fn => fn.mockReset())
    Object.values(mockAgent).forEach(fn => fn.mockReset())
    Object.values(mockCompany).forEach(fn => fn.mockReset())
    Object.values(mockMission).forEach(fn => fn.mockReset())
    Object.values(mockDocument).forEach(fn => fn.mockReset())
    Object.values(mockMissionNotification).forEach(fn => fn.mockReset())
    Object.values(mockMissionLog).forEach(fn => fn.mockReset())
    Object.values(mockVerificationToken).forEach(fn => fn.mockReset())
}
