import { resend, EMAIL_FROM, type EmailResult } from '../config'

export interface MissionSummary {
    title: string
    date: Date
    hours: number
    company: string
}

/**
 * Send monthly recap email to agents
 */
export async function sendMonthlyRecapEmail(
    email: string,
    name: string,
    month: string,
    missions: MissionSummary[],
    totalHours: number
): Promise<EmailResult> {
    if (!resend) {
        return { success: true, dev: true }
    }

    const missionRows = missions.map(m => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${m.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${m.date.toLocaleDateString('fr-FR')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${m.company}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${m.hours}h</td>
        </tr>
    `).join('')

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `📊 Récapitulatif ${month} - ${totalHours}h travaillées`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .stat-num { font-size: 36px; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1e3a5f; color: white; padding: 12px; text-align: left; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Récapitulatif ${month}</h1>
            <p>Bonjour ${name}</p>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-num">${missions.length}</div>
                    <div>Missions</div>
                </div>
                <div class="stat-box">
                    <div class="stat-num">${totalHours}h</div>
                    <div>Travaillées</div>
                </div>
            </div>
            
            <h3>Détail des missions :</h3>
            <table>
                <thead>
                    <tr>
                        <th>Mission</th>
                        <th>Date</th>
                        <th>Entreprise</th>
                        <th style="text-align: right;">Heures</th>
                    </tr>
                </thead>
                <tbody>
                    ${missionRows || '<tr><td colspan="4" style="padding: 20px; text-align: center;">Aucune mission ce mois-ci</td></tr>'}
                </tbody>
            </table>
        </div>
        <div class="footer">
            <p>Ce récapitulatif est généré automatiquement.</p>
            <p>© 2026 VARD Platform - Sécurité Privée</p>
        </div>
    </div>
</body>
</html>
      `,
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to send monthly recap email:', error)
        return { success: false, error }
    }
}
