import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logError } from '@/lib/logger'

export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational: boolean

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.isOperational = isOperational
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

// Common HTTP Errors
export class NotFoundError extends AppError {
    constructor(message: string = 'Ressource introuvable') {
        super(message, 404, 'NOT_FOUND', true)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Non autorisé') {
        super(message, 401, 'UNAUTHORIZED', true)
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Accès interdit') {
        super(message, 403, 'FORBIDDEN', true)
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Requête invalide') {
        super(message, 400, 'BAD_REQUEST', true)
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT', true)
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Trop de requêtes') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', true)
    }
}

type ErrorResponse = {
    error: string
    code?: string
    details?: unknown
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
    // 1. Log the error (Already handles Sentry + Pino)
    // context is inferred from error type or generic 'api-error'

    // 2. Handle known AppError
    if (error instanceof AppError) {
        // Operational errors (trusted) - Log as info/warn usually, but we log all as error for now in Sentry? 
        // No, operational errors are often user mistakes (400, 404). We might not want to spam Sentry/Logs with stack traces for 404s.
        // For now, let's keep it simple: Log everything via logError, but we could refine later.
        if (error.statusCode < 500) {
            // Client error - maybe just warn?
            // logError handles everything as .error() currently.
            // Let's rely on logError to handle dispatch.
            logError(error, { type: 'operational', code: error.code })
        } else {
            logError(error, { type: 'server', code: error.code })
        }

        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        )
    }

    // 3. Handle ZodError
    if (error instanceof ZodError) {
        logError(error, { type: 'validation' })
        return NextResponse.json(
            { error: 'Données invalides', code: 'VALIDATION_ERROR', details: error.flatten() },
            { status: 400 }
        )
    }

    // 4. Handle Unknown/Server Custom Errors
    logError(error, { type: 'unhandled' })

    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json(
        {
            error: 'Erreur serveur interne',
            code: 'INTERNAL_SERVER_ERROR',
            details: isDev ? String(error) : undefined
        },
        { status: 500 }
    )
}
