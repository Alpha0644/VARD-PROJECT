import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/db')
vi.mock('bcryptjs')
vi.mock('@/lib/email', () => ({
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}))

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should register a new user successfully', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'AGENT',
        }

            // Use direct mock on the imported db object
            ; (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
            ; (db.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
            ; (hash as ReturnType<typeof vi.fn>).mockResolvedValue('hashed_password')

        const request = new Request('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'SecurePass123',
                name: 'Test User',
                role: 'AGENT',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.user.email).toBe('test@example.com')
        expect(db.user.create).toHaveBeenCalled()
    })

    it('should return 409 if email already exists', async () => {
        ; (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing' })

        const request = new Request('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'existing@example.com',
                password: 'SecurePass123',
                name: 'Test',
                role: 'AGENT',
            }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(409)
        expect(data.error).toContain('existe déjà')
    })

    it('should return 400 for invalid password', async () => {
        const request = new Request('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'weak',
                name: 'Test',
                role: 'AGENT',
            }),
        })

        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('should enforce rate limiting after 3 attempts', async () => {
        // Simulate 3 rapid requests
        const makeRequest = () =>
            POST(
                new Request('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'spam@example.com',
                        password: 'SecurePass123',
                        name: 'Spammer',
                        role: 'AGENT',
                    }),
                })
            )

        // First 3 should work (or fail for other reasons)
        await makeRequest()
        await makeRequest()
        await makeRequest()

        // 4th should be rate limited
        const response = await makeRequest()

        expect(response.status).toBe(429)
    })
})
