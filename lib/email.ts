import { Resend } from 'resend'

// Initialize Resend (will be undefined if no API key)
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

// Email sender address (configurable via env)
const EMAIL_FROM = process.env.EMAIL_FROM || 'VARD Platform <noreply@vard.app>'

// ============================================
// TEMPLATE: Verification Email
// ============================================
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

// ============================================
// TEMPLATE: Password Reset
// ============================================
export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    if (!resend) {
        console.log('[DEV] Password reset email would be sent to:', email)
        console.log('[DEV] Reset URL:', resetUrl)
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

// ============================================
// TEMPLATE: Welcome Email (after registration)
// ============================================
export async function sendWelcomeEmail(email: string, name: string, role: 'AGENT' | 'COMPANY') {
    if (!resend) {
        console.log('[DEV] Welcome email would be sent to:', email)
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
                    <span>Uploadez vos documents (${role === 'AGENT' ? 'Carte Pro CNAPS, Pièce d\'identité' : 'SIREN, Kbis'})</span>
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
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Accéder à mon dashboard</a>
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

// ============================================
// TEMPLATE: Document Approved
// ============================================
export async function sendDocumentApprovedEmail(email: string, documentType: string) {
    if (!resend) {
        console.log('[DEV] Document approved email would be sent to:', email)
        return { success: true, dev: true }
    }

    const docNames: Record<string, string> = {
        'CNAPS': 'Carte Professionnelle CNAPS',
        'ID': 'Pièce d\'identité',
        'SIREN': 'Extrait SIREN',
        'KBIS': 'Extrait Kbis',
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '✅ Document validé - VARD',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .success-box { background: #dcfce7; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Document Validé</h1>
        </div>
        <div class="content">
            <div class="success-box">
                <h2 style="color: #16a34a; margin: 0;">🎉 Félicitations !</h2>
                <p style="margin: 10px 0 0 0;">Votre <strong>${docNames[documentType] || documentType}</strong> a été validé.</p>
            </div>
            <p>Votre document a été vérifié et approuvé par notre équipe de validation.</p>
            <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.</p>
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
        console.error('Failed to send document approved email:', error)
        return { success: false, error }
    }
}

// ============================================
// TEMPLATE: Document Rejected
// ============================================
export async function sendDocumentRejectedEmail(email: string, documentType: string, reason?: string) {
    if (!resend) {
        console.log('[DEV] Document rejected email would be sent to:', email)
        return { success: true, dev: true }
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: '❌ Document refusé - Action requise - VARD',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .error-box { background: #fef2f2; border: 1px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Document Refusé</h1>
        </div>
        <div class="content">
            <div class="error-box">
                <p style="margin: 0;"><strong>Document :</strong> ${documentType}</p>
                ${reason ? `<p style="margin: 10px 0 0 0;"><strong>Motif :</strong> ${reason}</p>` : ''}
            </div>
            <p>Votre document n'a pas pu être validé. Veuillez uploader un nouveau document conforme.</p>
            <p><strong>Conseils :</strong></p>
            <ul>
                <li>Assurez-vous que le document est lisible</li>
                <li>Vérifiez que la date de validité n'est pas dépassée</li>
                <li>Le fichier doit être en PDF, JPG ou PNG</li>
            </ul>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Uploader un nouveau document</a>
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
        console.error('Failed to send document rejected email:', error)
        return { success: false, error }
    }
}

// ============================================
// TEMPLATE: New Mission Available
// ============================================
export async function sendMissionNotificationEmail(
    email: string,
    missionTitle: string,
    location: string,
    startDate: Date,
    companyName: string
) {
    if (!resend) {
        console.log('[DEV] Mission notification email would be sent to:', email)
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
                <a href="${process.env.NEXTAUTH_URL}/agent/dashboard" class="button">Voir la mission</a>
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

// ============================================
// TEMPLATE: Monthly Recap
// ============================================
interface MissionSummary {
    title: string
    date: Date
    hours: number
    company: string
}

export async function sendMonthlyRecapEmail(
    email: string,
    name: string,
    month: string,
    missions: MissionSummary[],
    totalHours: number
) {
    if (!resend) {
        console.log('[DEV] Monthly recap email would be sent to:', email)
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
