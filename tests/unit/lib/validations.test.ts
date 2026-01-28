import { loginSchema, registerAgentSchema, registerCompanySchema } from '@/lib/validations/auth'
import { agentProfileSchema, companyProfileSchema } from '@/lib/validations/profile'
import { createMissionSchema } from '@/lib/validations/mission'

describe('Validation Schemas', () => {
    describe('Auth', () => {
        it('should validate correct login data', () => {
            const result = loginSchema.safeParse({ email: 'test@test.com', password: 'password' })
            expect(result.success).toBe(true)
        })

        it('should reject invalid emails', () => {
            const result = loginSchema.safeParse({ email: 'invalid-email', password: 'password' })
            expect(result.success).toBe(false)
        })

        it('should validate correct agent registration', () => {
            // Valid CNAPS format check
            const result = registerAgentSchema.safeParse({
                email: 'agent@test.com',
                password: 'password123',
                name: 'James Bond',
                cartePro: '1234567890XX',
                carteProExp: '2030-01-01'
            })
            expect(result.success).toBe(true)
        })

        it('should reject short passwords', () => {
            const result = registerAgentSchema.safeParse({
                email: 'agent@test.com',
                password: 'short',
                name: 'James Bond',
                cartePro: '1234567890XX',
                carteProExp: '2030-01-01'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('Profile', () => {
        it('should validate correct agent profile', () => {
            const result = agentProfileSchema.safeParse({
                bio: 'Experienced security guard',
                operatingRadius: 50,
                specialties: ['SSIAP 1']
            })
            expect(result.success).toBe(true)
        })

        it('should enforce max specialty count', () => {
            const result = agentProfileSchema.safeParse({
                specialties: new Array(15).fill('Spec')
            })
            expect(result.success).toBe(false)
        })

        it('should validate correct company profile', () => {
            const result = companyProfileSchema.safeParse({
                companyName: 'VARD Security',
                website: 'https://vard.com'
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid website url', () => {
            const result = companyProfileSchema.safeParse({
                companyName: 'VARD Security',
                website: 'not-a-url'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('Mission', () => {
        it('should reject past start dates', () => {
            const pastDate = new Date()
            pastDate.setDate(pastDate.getDate() - 1)

            const result = createMissionSchema.safeParse({
                title: 'Mission 1',
                location: 'Paris',
                startTime: pastDate.toISOString(),
                endTime: new Date().toISOString()
            })
            expect(result.success).toBe(false)
        })

        it('should ensure end time is after start time', () => {
            const start = new Date()
            start.setDate(start.getDate() + 1)
            const end = new Date(start)
            end.setHours(end.getHours() - 1) // End before start

            const result = createMissionSchema.safeParse({
                title: 'Mission 1',
                location: 'Paris',
                startTime: start.toISOString(),
                endTime: end.toISOString()
            })
            expect(result.success).toBe(false)
        })
    })
})
