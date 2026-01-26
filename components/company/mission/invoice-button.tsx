'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CheckCircle, Download } from 'lucide-react'
import { useState } from 'react'

interface InvoiceButtonProps {
    mission: {
        id: string
        title: string
        startTime: string
        endTime: string
        location: string
        agent?: {
            user: { name: string | null }
            cartePro: string
        } | null
    }
}

export function InvoiceButton({ mission }: InvoiceButtonProps) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = () => {
        setGenerating(true)
        const doc = new jsPDF()

        // 1. Header
        doc.setFontSize(22)
        doc.text('VARD', 20, 20)

        doc.setFontSize(10)
        doc.text('Relevé d\'heures de mission', 20, 30)
        doc.text(`Réf: ${mission.id.slice(0, 8).toUpperCase()}`, 20, 35)

        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 150, 20)

        // 2. Mission Details
        doc.setFontSize(14)
        doc.text('Détails de la Mission', 20, 50)

        doc.setFontSize(11)
        doc.text(`Mission: ${mission.title}`, 20, 60)
        doc.text(`Lieu: ${mission.location}`, 20, 67)

        if (mission.agent) {
            doc.text(`Agent: ${mission.agent.user.name || 'N/A'}`, 20, 80)
            doc.text(`Carte Pro: ${mission.agent.cartePro}`, 20, 87)
        }

        // 3. Timesheet Table
        const startDate = new Date(mission.startTime)
        const endDate = new Date(mission.endTime)
        const duration = ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(2)

        autoTable(doc, {
            startY: 100,
            head: [['Date', 'Activité', 'Début', 'Fin', 'Durée']],
            body: [
                [
                    startDate.toLocaleDateString('fr-FR'),
                    'Gardiennage / Sécurité',
                    startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    `${duration} h`
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [10, 22, 40] }
        })

        // 4. Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(10)
        doc.text('Ce document sert de justificatif pour la facturation.', 20, finalY)
        doc.setTextColor(150)
        doc.text('Généré par VARD - Plateforme de Sécurité Privée', 20, 280)

        // Save
        doc.save(`releve-heures-${mission.id.slice(0, 8)}.pdf`)
        setGenerating(false)
    }

    return (
        <button
            onClick={generatePDF}
            disabled={generating}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            {generating ? (
                <>Génération...</>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Télécharger Relevé
                </>
            )}
        </button>
    )
}
