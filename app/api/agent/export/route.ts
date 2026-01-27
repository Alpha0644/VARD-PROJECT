import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/agent/export - Génère un récapitulatif HTML des missions (à imprimer en PDF)
export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const agent = await db.agent.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        })

        if (!agent) {
            return NextResponse.json({ error: 'Profil agent non trouvé' }, { status: 404 })
        }

        // Get month from query params (default: current month)
        const { searchParams } = new URL(request.url)
        const monthParam = searchParams.get('month') // Format: 2026-01

        const now = new Date()
        let year = now.getFullYear()
        let month = now.getMonth()

        if (monthParam) {
            const [y, m] = monthParam.split('-').map(Number)
            if (y && m) {
                year = y
                month = m - 1  // JS months are 0-indexed
            }
        }

        const startOfMonth = new Date(year, month, 1)
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

        // Fetch completed missions for the month
        const missions = await db.mission.findMany({
            where: {
                agentId: agent.id,
                status: 'COMPLETED',
                updatedAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                company: {
                    select: { companyName: true }
                }
            },
            orderBy: { startTime: 'asc' }
        })

        // Calculate stats
        const HOURLY_RATE = 25
        let totalHours = 0

        const missionDetails = missions.map(m => {
            const start = new Date(m.startTime)
            const end = new Date(m.endTime)
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            totalHours += hours

            return {
                id: m.id,
                title: m.title,
                company: m.company.companyName,
                location: m.location,
                date: start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
                startTime: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                endTime: end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                hours: Math.round(hours * 10) / 10,
                earnings: Math.round(hours * HOURLY_RATE * 100) / 100
            }
        })

        const totalEarnings = Math.round(totalHours * HOURLY_RATE * 100) / 100
        const monthName = startOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

        // Generate HTML for PDF printing
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Récapitulatif ${monthName} - VARD</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #3B82F6; }
        .logo span { color: #111; }
        .agent-info { text-align: right; }
        .agent-name { font-size: 18px; font-weight: 600; }
        .agent-email { color: #666; font-size: 14px; }
        h1 { font-size: 24px; margin-bottom: 8px; text-transform: capitalize; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #3B82F6; }
        .stat-label { color: #666; font-size: 14px; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #3B82F6; color: white; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
        tr:nth-child(even) { background: #F9FAFB; }
        .amount { text-align: right; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #666; font-size: 12px; }
        @media print { body { padding: 20px; } .stat-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">VARD<span>®</span></div>
        <div class="agent-info">
            <div class="agent-name">${agent.user.name || 'Agent'}</div>
            <div class="agent-email">${agent.user.email}</div>
            <div class="agent-email">N° ${agent.cartePro}</div>
        </div>
    </div>
    
    <h1>Récapitulatif ${monthName}</h1>
    <p class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${missions.length}</div>
            <div class="stat-label">Missions effectuées</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(totalHours * 10) / 10}h</div>
            <div class="stat-label">Heures travaillées</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalEarnings.toLocaleString('fr-FR')}€</div>
            <div class="stat-label">Revenus estimés</div>
        </div>
    </div>
    
    ${missions.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Mission</th>
                <th>Client</th>
                <th>Horaires</th>
                <th>Durée</th>
                <th class="amount">Montant</th>
            </tr>
        </thead>
        <tbody>
            ${missionDetails.map(m => `
            <tr>
                <td>${m.date}</td>
                <td>${m.title}</td>
                <td>${m.company}</td>
                <td>${m.startTime} - ${m.endTime}</td>
                <td>${m.hours}h</td>
                <td class="amount">${m.earnings.toLocaleString('fr-FR')}€</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p style="text-align: center; color: #666; padding: 40px;">Aucune mission complétée ce mois-ci.</p>'}
    
    <div class="footer">
        <p>VARD - Plateforme de mise en relation pour agents de sécurité</p>
        <p>Document généré automatiquement • Taux horaire indicatif : ${HOURLY_RATE}€/h</p>
    </div>
</body>
</html>
`

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="recap-${monthParam || `${year}-${String(month + 1).padStart(2, '0')}`}.html"`
            }
        })

    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
