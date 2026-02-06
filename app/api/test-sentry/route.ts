import { NextResponse } from 'next/server'
import { logError } from '@/lib/logger'

export async function GET() {
    try {
        // Force a runtime error for testing
        throw new Error('Sentry Test Error - Structured Logging Integration')
    } catch (error) {
        logError(error, {
            testing: true,
            timestamp: new Date().toISOString(),
            testId: 'SENTRY_VERIFICATION_001'
        })

        return NextResponse.json({
            message: 'Test error triggered and logged.',
            note: 'Check Sentry dashboard and local logs.'
        })
    }
}
