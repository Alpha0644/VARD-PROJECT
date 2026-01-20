import { resend, EMAIL_FROM, getBaseUrl, type EmailResult } from '../config'

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(
    email: string,
    name: string,
    role: 'AGENT' | 'COMPANY'
): Promise<EmailResult> {
    if (!resend) {
        return { success: true, dev: true }
    }

    const roleText = role === 'AGENT'
        ? "Vous pouvez maintenant recevoir des missions de sécurité dans votre zone."
        : "Vous pouvez maintenant publier des missions et trouver des agents qualifiés."

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '🎉 Bienvenue sur VARD - Votre compte est prêt !',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 30px; }
        .steps { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: center; margin: 10px 0; }
        .step-num { background: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #1e3a5f; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bienvenue ${name} !</h1>
            <p>Votre compte ${role === 'AGENT' ? 'Agent' : 'Entreprise'} est maintenant actif</p>
        </div>
        <div class="content">
            <p>${roleText}</p>
            
            <div class="steps">
                <h3>📋 Prochaines étapes :</h3>
                <div class="step">
                    <div class="step-num">1</div>
                    <span>Uploadez vos documents (${role === 'AGENT' ? "Carte Pro CNAPS, Pièce d'identité" : 'SIREN, Kbis'})</span>
                </div>
                <div class="step">
                    <div class="step-num">2</div>
                    <span>Attendez la validation par notre équipe (24-48h)</span>
                </div>
                <div class="step">
                    <div class="step-num">3</div>
                    <span>${role === 'AGENT' ? 'Activez votre localisation pour recevoir des missions' : 'Publiez votre première mission'}</span>
                </div>
            </div>
            
            <a href="${getBaseUrl()}/dashboard" class="button">Accéder à mon dashboard</a>
        </div>
        <div class="footer">
            <p>Des questions ? Contactez-nous à support@vard.app</p>
            <p>© 2026 VARD Platform</p>
        </div>
    </div>
</body>
</html>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        return { success: false, error }
    }
}
