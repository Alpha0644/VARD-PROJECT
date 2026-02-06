
import { describe, it, expect, vi } from 'vitest'
import { AppError, handleApiError, NotFoundError } from '../../lib/api-error'
import { NextResponse } from 'next/server'

// Mock logger
vi.mock('@/lib/logger', () => ({
    logError: vi.fn(),
    logger: {
        error: vi.fn(),
        info: vi.fn()
    }
}))

describe('AppError', () => {
    it('should create an error with correct properties', () => {
        const error = new AppError('Test Error', 400, 'TEST_ERROR', true)
        expect(error.message).toBe('Test Error')
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe('TEST_ERROR')
        expect(error.isOperational).toBe(true)
    })

    it('should have correct prototype', () => {
        const error = new NotFoundError()
        expect(error).toBeInstanceOf(AppError)
        expect(error).toBeInstanceOf(Error)
    })
})

describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
        const error = new AppError('Test Error', 418, 'I_AM_A_TEAPOT')
        const response = handleApiError(error)

        // In a real Next.js env, we'd check response.json() verify status
        // But verify basic return structure here if possible or just execution
        expect(response).toBeDefined()
        expect(response.status).toBe(418)
    })

    it('should handle unknown errors as 500', () => {
        const error = new Error('Random Boom')
        const response = handleApiError(error)

        expect(response.status).toBe(500)
    })
})
