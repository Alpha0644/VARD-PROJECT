import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { DocumentType } from '@/lib/documents'
import { CheckCircle, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AgentDocumentsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    // Fetch all documents for the agent, ordered by latest first
    const documents = await db.document.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    })

    // Helper to get latest doc of a type
    const getLatestDoc = (type: DocumentType) => {
        return documents.find(d => d.type === type)
    }

    const cnaps = getLatestDoc(DocumentType.CNAPS)
    const idCard = getLatestDoc(DocumentType.ID_CARD)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-6 mb-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
                    <p className="text-gray-500 mt-1">Gérez vos justificatifs obligatoires pour exercer.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 space-y-8">

                {/* CNAPS Section */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Carte Professionnelle (CNAPS)
                    </h2>

                    {/* Status Card */}
                    {cnaps && (
                        <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900">{cnaps.name}</h3>
                                        <StatusBadge status={cnaps.status} expiresAt={cnaps.expiresAt} />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Envoyé le {format(cnaps.createdAt, 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                    {cnaps.expiresAt && (
                                        <p className={`text-sm mt-1 font-medium ${cnaps.expiresAt < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                                            Expire le : {format(cnaps.expiresAt, 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                    )}
                                </div>
                                <a
                                    href={cnaps.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Voir
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    <DocumentUpload
                        type={DocumentType.CNAPS}
                        label={cnaps ? "Mettre à jour ma carte CNAPS" : "Ajouter ma carte CNAPS"}
                        description="Format PDF, JPG ou PNG. Assurez-vous que la date d'expiration est lisible."
                    />
                </section>

                <hr className="border-gray-200" />

                {/* ID Card Section */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Pièce d'Identité
                    </h2>

                    {idCard && (
                        <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900">{idCard.name}</h3>
                                        <StatusBadge status={idCard.status} expiresAt={idCard.expiresAt} />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Envoyé le {format(idCard.createdAt, 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                    {idCard.expiresAt && (
                                        <p className={`text-sm mt-1 font-medium ${idCard.expiresAt < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                                            Expire le : {format(idCard.expiresAt, 'dd MMMM yyyy', { locale: fr })}
                                        </p>
                                    )}
                                </div>
                                <a
                                    href={idCard.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Voir
                                </a>
                            </div>
                        </div>
                    )}

                    <DocumentUpload
                        type={DocumentType.ID_CARD}
                        label={idCard ? "Mettre à jour ma pièce d'identité" : "Ajouter ma pièce d'identité"}
                        description="CNI ou Passeport en cours de validité."
                    />
                </section>

            </div>
        </div>
    )
}

function StatusBadge({ status, expiresAt }: { status: string, expiresAt: Date | null }) {
    // Check expiration first if verified
    const isExpired = status === 'VERIFIED' && expiresAt && expiresAt < new Date()

    if (isExpired) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3" />
                Expiré
            </span>
        )
    }

    switch (status) {
        case 'VERIFIED':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Validé
                </span>
            )
        case 'PENDING':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3" />
                    En attente
                </span>
            )
        case 'REJECTED':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3" />
                    Rejeté
                </span>
            )
        default:
            return null
    }
}
