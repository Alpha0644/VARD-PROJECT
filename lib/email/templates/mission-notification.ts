import { resend, EMAIL_FROM, getBaseUrl, type EmailResult } from '../config'

/**
 * Send mission notification email to nearby agents
 */
export async function sendMissionNotificationEmail(
    email: string,
    missionTitle: string,
    location: string,
    startDate: Date,
    companyName: string
): Promise<EmailResult> {
    if (!resend) {
        return { success: true, dev: true }
    }

    const formattedDate = startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    })

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `🚨 Nouvelle mission disponible : ${missionTitle}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f97316 0%, #eab308 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .mission-card { background: #fffbeb; border: 2px solid #f97316; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .mission-detail { display: flex; align-items: center; margin: 10px 0; }
        .icon { font-size: 20px; margin-right: 10px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .urgent { background: #dc2626; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .footer { background: #1e3a5f; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="urgent">⚡ URGENT</span>
            <h1>Nouvelle Mission !</h1>
        </div>
        <div class="content">
            <div class="mission-card">
                <h2 style="margin-top: 0;">${missionTitle}</h2>
                <div class="mission-detail">
                    <span class="icon">📍</span>
                    <span><strong>Lieu :</strong> ${location}</span>
                </div>
                <div class="mission-detail">
                    <span class="icon">📅</span>
                    <span><strong>Date :</strong> ${formattedDate}</span>
                </div>
                <div class="mission-detail">
                    <span class="icon">🏢</span>
                    <span><strong>Entreprise :</strong> ${companyName}</span>
                </div>
            </div>
            <p style="text-align: center; font-size: 18px;"><strong>Premier arrivé, premier servi !</strong></p>
            <p style="text-align: center;">
                <a href="${getBaseUrl()}/agent/dashboard" class="button">Voir la mission</a>
            </p>
        </div>
        <div class="footer">
            <p>Vous recevez cet email car vous êtes dans la zone de cette mission.</p>
            <p>© 2026 VARD Platform</p>
        </div>
    </div>
</body>
</html>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send mission notification email:', error)
        return { success: false, error }
    }
}
