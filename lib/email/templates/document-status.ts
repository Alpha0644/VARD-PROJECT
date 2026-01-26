import { resend, EMAIL_FROM } from '../config'

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
