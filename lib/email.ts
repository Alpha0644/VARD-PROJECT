import { Resend } from 'resend'

// Initialize Resend (will be undefined if no API key)
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

export async function sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    if (!resend) {
        console.log('[DEV] Verification email would be sent to:', email)
        console.log('[DEV] Verification URL:', verifyUrl)
        return { success: true, dev: true }
    }

    try {
        await resend.emails.send({
            from: 'noreply@yourdomain.com', // Update with your domain
            to: email,
            subject: 'Vérifiez votre adresse email',
            html: `
        <h2>Bienvenue !</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verifyUrl}">Vérifier mon email</a>
        <p>Ce lien est valide pendant 24 heures.</p>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send verification email:', error)
        return { success: false, error }
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    if (!resend) {
        console.log('[DEV] Password reset email would be sent to:', email)
        console.log('[DEV] Reset URL:', resetUrl)
        return { success: true, dev: true }
    }

    try {
        await resend.emails.send({
            from: 'noreply@yourdomain.com', // Update with your domain
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien est valide pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send password reset email:', error)
        return { success: false, error }
    }
}
