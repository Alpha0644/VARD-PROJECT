import { Resend } from 'resend'

// Initialize Resend (will be undefined if no API key)
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

// Email sender address (configurable via env)
export const EMAIL_FROM = process.env.EMAIL_FROM || 'VARD Platform <noreply@vard.app>'

// Common email result type
export interface EmailResult {
    success: boolean
    dev?: boolean
    error?: unknown
}

// Base URL helper
export const getBaseUrl = () => process.env.NEXTAUTH_URL || 'http://localhost:3000'
