'use client'

import { AlertTriangle, Ban } from 'lucide-react'
import Link from 'next/link'

interface ExpirationAlertProps {
    status: {
        canOperate: boolean
        reason?: string
        warning?: string
    }
}

export function ExpirationAlert({ status }: ExpirationAlertProps) {
    if (status.canOperate && !status.warning) return null

    // Blocking State (Expired)
    if (!status.canOperate) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
                <div className="max-w-4xl mx-auto flex items-start gap-4">
                    <div className="p-2 bg-red-700 rounded-lg shrink-0">
                        <Ban className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Compte Suspendu</h3>
                        <p className="text-red-100 mb-3">
                            {status.reason || "Vos documents obligatoires ont expiré."}
                        </p>
                        <Link
                            href="/agent/documents"
                            className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                            Mettre à jour mes documents
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Warning State (Expiring Soon)
    if (status.warning) {
        return (
            <div className="absolute top-4 left-4 right-4 z-40">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-yellow-800 font-medium heading-font">
                            Action Requise
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {status.warning}
                        </p>
                        <Link
                            href="/agent/documents"
                            className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900 mt-2 inline-block"
                        >
                            Renouveler maintenant
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
