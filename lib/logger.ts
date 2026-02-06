/**
 * VARD Production Logger
 * Uses Pino for structured JSON logging in production
 * Pretty-prints in development for readability
 * 
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info({ userId: '123' }, 'User logged in')
 *   logger.error({ err }, 'Database connection failed')
 */

import pino from 'pino'
import * as Sentry from '@sentry/nextjs'


const isDev = process.env.NODE_ENV !== 'production'

// Create logger with appropriate configuration
export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

    // Base context added to all logs
    base: {
        env: process.env.NODE_ENV || 'development',
        app: 'vard',
    },

    // Timestamp configuration
    timestamp: pino.stdTimeFunctions.isoTime,

    // Format options for development
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname,env,app',
            },
        },
    }),

    // Redact sensitive fields automatically
    redact: {
        paths: ['password', 'passwordHash', 'token', 'authorization', 'cookie'],
        remove: true,
    },
})

// Convenience methods for common log patterns
export const logRequest = (method: string, path: string, statusCode: number, durationMs: number) => {
    logger.info({ method, path, statusCode, durationMs }, 'Request completed')
}

export const logError = (error: unknown, context?: Record<string, unknown>) => {
    if (error instanceof Error) {
        logger.error({ err: error, ...context }, error.message)
        // Forward to Sentry
        Sentry.captureException(error, { extra: context })
    } else {
        logger.error({ error, ...context }, 'Unknown error occurred')
        Sentry.captureMessage('Unknown error occurred', {
            level: 'error',
            extra: { error, ...context }
        })
    }
}

export const logAuth = (action: string, userId: string, success: boolean) => {
    logger.info({ action, userId, success }, `Auth: ${action}`)
}

export const logMission = (action: string, missionId: string, context?: Record<string, unknown>) => {
    logger.info({ action, missionId, ...context }, `Mission: ${action}`)
}

// Export default for simple import
export default logger
