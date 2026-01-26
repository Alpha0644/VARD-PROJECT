import { Resend } from 'resend'

// Initialize Resend
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

// Email sender address
export const EMAIL_FROM = process.env.EMAIL_FROM || 'VARD Platform <noreply@vard.app>'
