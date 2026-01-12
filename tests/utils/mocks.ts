import { vi } from 'vitest'
import type { Session } from 'next-auth'
import type { PrismaClient } from '@prisma/client'

/**
 * Mock Types for Tests
 * Replaces all `as any` casts with proper typing
 */

export interface MockPrismaClient {
    user: {
        findUnique: ReturnType<typeof vi.fn>
        findMany: ReturnType<typeof vi.fn>
        create: ReturnType<typeof vi.fn>
        update: ReturnType<typeof vi.fn>
        delete: ReturnType<typeof vi.fn>
    }
    agent: {
        findUnique: ReturnType<typeof vi.fn>
        findMany: ReturnType<typeof vi.fn>
        create: ReturnType<typeof vi.fn>
    }
    company: {
        findUnique: ReturnType<typeof vi.fn>
        findMany: ReturnType<typeof vi.fn>
        create: ReturnType<typeof vi.fn>
    }
    mission: {
        findUnique: ReturnType<typeof vi.fn>
        findMany: ReturnType<typeof vi.fn>
        create: ReturnType<typeof vi.fn>
        count: ReturnType<typeof vi.fn>
    }
    document: {
        findMany: ReturnType<typeof vi.fn>
        updateMany: ReturnType<typeof vi.fn>
    }
    missionNotification: {
        findMany: ReturnType<typeof vi.fn>
    }
}

export interface MockAuthSession {
    user: {
        id: string
        email: string
        name: string
        role: 'AGENT' | 'COMPANY' | 'ADMIN'
        isVerified: boolean
    }
}

export type MockAuthFunction = ReturnType<typeof vi.fn<[], Promise<Session | null>>>

/**
 * Create typed mock for auth function
 */
export function createMockAuth(): MockAuthFunction {
    return vi.fn<[], Promise<Session | null>>()
}

/**
 * Create typed mock for Prisma DB
 */
export function createMockDb(): MockPrismaClient {
    return {
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        agent: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
        },
        company: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
        },
        mission: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            count: vi.fn(),
        },
        document: {
            findMany: vi.fn(),
            updateMany: vi.fn(),
        },
        missionNotification: {
            findMany: vi.fn(),
        },
    }
}
