import { resend, EMAIL_FROM, getBaseUrl, type EmailResult } from '../config'

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<EmailResult> {
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`

    if (!resend) {
        return { success: true, dev: true }
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '🔐 Réinitialisation de mot de passe - VARD',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Réinitialisation</h1>
        </div>
        <div class="content">
            <h2>Mot de passe oublié ?</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe VARD.</p>
            <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 1 heure.</p>
            <p style="color: #dc2626; font-size: 14px;"><strong>⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 VARD Platform - Sécurité Privée</p>
        </div>
    </div>
</body>
</html>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send password reset email:', error)
        return { success: false, error }
    }
}
