import { resend, EMAIL_FROM } from '../config'

export async function sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    if (!resend) {
        console.log('[DEV] Verification email would be sent to:', email)
        console.log('[DEV] Verification URL:', verifyUrl)
        return { success: true, dev: true }
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '✅ Vérifiez votre adresse email - VARD',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ VARD Platform</h1>
        </div>
        <div class="content">
            <h2>Bienvenue sur VARD !</h2>
            <p>Merci de vous être inscrit sur la plateforme de mise en relation pour la sécurité privée.</p>
            <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
            <a href="${verifyUrl}" class="button">Vérifier mon email</a>
            <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 24 heures.</p>
            <p style="color: #999; font-size: 12px;">Si le bouton ne fonctionne pas, copiez ce lien : ${verifyUrl}</p>
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
        console.error('Failed to send verification email:', error)
        return { success: false, error }
    }
}
