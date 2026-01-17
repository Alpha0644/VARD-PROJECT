import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pusherServer } from '@/lib/pusher'

// Mock Pusher class from the library
vi.mock('pusher', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            trigger: vi.fn().mockResolvedValue({ status: 200 })
        }))
    }
})

describe('Pusher Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should be instantiated', () => {
        expect(pusherServer).toBeDefined()
    })

    it('should have a trigger method', async () => {
        // Since we mocked the class implementation in lib/pusher.ts implicitly by mocking the module
        // we can check if trigger calls go through.

        await pusherServer.trigger('test-channel', 'test-event', { hello: 'world' })

        // We need to access the mock to verify. 
        // Since 'pusherServer' is an instance of the mocked class:
        expect(pusherServer.trigger).toHaveBeenCalledWith(
            'test-channel',
            'test-event',
            { hello: 'world' }
        )
    })
})
