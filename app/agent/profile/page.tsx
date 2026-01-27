import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { LogOut, User, Shield, FileCheck, Bell, ChevronRight, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react'

export default async function AgentProfilePage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    const agent = await db.agent.findUnique({
        where: { userId: session.user.id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        }
    })

    if (!agent) redirect('/login')

    // Get documents from the Document model
    const documents = await db.document.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    })

    // Get Review Stats
    const reviewStats = await db.review.aggregate({
        where: { targetId: session.user.id },
        _avg: { rating: true },
        _count: true
    })

    const averageRating = reviewStats._avg.rating ? reviewStats._avg.rating.toFixed(1) : null
    const reviewCount = reviewStats._count

    // Check if all required documents are verified
    const isVerified = documents.some(d => d.type === 'CNAPS' && d.status === 'VERIFIED')

    // Document display info
    const documentsList = [
        {
            name: 'Carte Professionnelle',
            type: 'CNAPS',
            document: documents.find(d => d.type === 'CNAPS'),
            value: agent.cartePro
        },
        {
            name: 'Pièce d\'identité',
            type: 'ID_CARD',
            document: documents.find(d => d.type === 'ID_CARD'),
            value: null
        },
    ]

    const getStatusStyle = (status: string | undefined) => {
        if (status === 'VERIFIED') return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Vérifié' }
        if (status === 'REJECTED') return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Rejeté' }
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24" >
            {/* Header */}
            < div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-20 pb-8" >
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/30">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{agent.user.name || 'Agent'}</h1>
                        <p className="text-blue-200 text-sm">{agent.user.email}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            {averageRating ? (
                                <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-white text-xs font-medium">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{averageRating}</span>
                                    <span className="opacity-70">({reviewCount})</span>
                                </div>
                            ) : null}
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${isVerified
                                ? 'bg-green-400/20 text-green-100'
                                : 'bg-yellow-400/20 text-yellow-100'
                                }`}>
                                {isVerified ? '✓ Vérifié' : '⏳ En attente'}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Content */}
            < div className="px-4 py-6 space-y-6 max-w-lg mx-auto" >

                {/* Agent Info */}
                < section >
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        Informations Agent
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">N° Carte Professionnelle</p>
                                <p className="font-mono font-bold text-gray-900">{agent.cartePro}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Expire le</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(agent.carteProExp).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section >

                {/* Documents Section */}
                < section >
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        Mes Documents
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {documentsList.map((doc, idx) => {
                            const style = getStatusStyle(doc.document?.status)
                            const StatusIcon = style.icon
                            return (
                                <div
                                    key={doc.type}
                                    className={`flex items-center justify-between p-4 ${idx < documentsList.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                                            <FileCheck className={`w-5 h-5 ${style.text}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{doc.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {doc.value || doc.document?.name || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 ${style.text}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">{style.label}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section >

                {/* Settings Section */}
                < section >
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        Paramètres
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <button className="flex items-center justify-between w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Notifications</p>
                                    <p className="text-xs text-gray-500">Gérer les alertes</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>

                        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Confidentialité</p>
                                    <p className="text-xs text-gray-500">Données personnelles</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </section >

                {/* Logout */}
                < section >
                    <form action="/api/auth/signout" method="POST">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-2xl transition-colors border border-red-100"
                        >
                            <LogOut className="w-5 h-5" />
                            Se déconnecter
                        </button>
                    </form>
                </section >

                {/* App Version */}
                < p className="text-center text-xs text-gray-400 pt-4" >
                    VARD Agent v1.0 • Build 2026.01
                </p >
            </div >
        </div >
    )
}
