/**
 * Email Module - Barrel Export
 * 
 * All email templates are now modular and organized by function.
 * Import any email function from '@/lib/email'
 */

// Re-export all templates
export { sendVerificationEmail } from './templates/verification'
export { sendPasswordResetEmail } from './templates/password-reset'
export { sendWelcomeEmail } from './templates/welcome'
export { sendDocumentApprovedEmail, sendDocumentRejectedEmail } from './templates/document-status'
export { sendMissionNotificationEmail } from './templates/mission-notification'
export { sendMonthlyRecapEmail, type MissionSummary } from './templates/monthly-recap'

// Re-export config for advanced usage
export { resend, EMAIL_FROM, type EmailResult } from './config'
