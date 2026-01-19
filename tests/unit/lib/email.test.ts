import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Resend constructor
const mockSend = vi.fn()
vi.mock('resend', () => ({
    Resend: vi.fn(() => ({
        emails: {
            send: mockSend
        }
    }))
}))

describe('Email Templates', () => {
    // Variable pour stocker les fonctions importées dynamiquement
    let emailLib: typeof import('@/lib/email')

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.resetModules() // Important: reset module cache
        process.env.RESEND_API_KEY = 're_test_key'

        // Dynamic import AFTER setting env var
        emailLib = await import('@/lib/email')
    })

    afterEach(() => {
        delete process.env.RESEND_API_KEY
    })

    describe('sendVerificationEmail', () => {
        it('calls resend with correct parameters', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendVerificationEmail('test@example.com', 'token123')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: expect.stringContaining('Vérifiez votre adresse email'),
                html: expect.stringContaining('token123')
            }))
        })
    })

    describe('sendPasswordResetEmail', () => {
        it('calls resend with correct parameters', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendPasswordResetEmail('test@example.com', 'token456')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: expect.stringContaining('Réinitialisation'),
                html: expect.stringContaining('token456')
            }))
        })
    })

    describe('sendWelcomeEmail', () => {
        it('sends correct content for AGENT', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendWelcomeEmail('agent@example.com', 'Agent 007', 'AGENT')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: 'agent@example.com',
                subject: expect.stringContaining('Bienvenue'),
                html: expect.stringContaining('recevoir des missions')
            }))
        })

        it('sends correct content for COMPANY', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendWelcomeEmail('company@example.com', 'Security Corp', 'COMPANY')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: 'company@example.com',
                html: expect.stringContaining('publier des missions')
            }))
        })
    })

    describe('sendDocumentStatusEmail', () => {
        it('sends approved email', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendDocumentApprovedEmail('user@example.com', 'CNAPS')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                subject: expect.stringContaining('Document validé'),
                html: expect.stringContaining('CNAPS')
            }))
        })

        it('sends rejected email with reason', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })

            await emailLib.sendDocumentRejectedEmail('user@example.com', 'ID', 'Trop flou')

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                subject: expect.stringContaining('Document refusé'),
                html: expect.stringContaining('Trop flou')
            }))
        })
    })

    describe('sendMissionNotificationEmail', () => {
        it('formats date and location correctly', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })
            const date = new Date('2026-02-01T10:00:00')

            await emailLib.sendMissionNotificationEmail(
                'agent@example.com',
                'Mission Test',
                'Paris',
                date,
                'Big Corp'
            )

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                subject: expect.stringContaining('Nouvelle mission'),
                html: expect.stringContaining('Big Corp')
            }))
        })
    })

    describe('sendMonthlyRecapEmail', () => {
        it('generates table with missions', async () => {
            mockSend.mockResolvedValue({ id: 'email-id' })
            const missions = [
                { title: 'M1', date: new Date(), hours: 5, company: 'C1' },
                { title: 'M2', date: new Date(), hours: 3, company: 'C2' }
            ]

            await emailLib.sendMonthlyRecapEmail(
                'agent@example.com',
                'John',
                'Janvier',
                missions,
                8
            )

            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                subject: expect.stringContaining('Janvier'),
                html: expect.stringContaining('8h')
            }))
        })
    })
})
