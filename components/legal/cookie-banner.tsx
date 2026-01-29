'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('vard-cookie-consent')
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('vard-cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('vard-cookie-consent', 'declined')
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 inset-x-0 z-50 p-4"
                >
                    <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur text-white p-6 rounded-2xl shadow-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Confidentialité & Cookies 🍪</h3>
                            <p className="text-gray-300 text-sm">
                                Nous utilisons des cookies pour assurer le bon fonctionnement de la plateforme (session, sécurité) et analyser le trafic anonymement.
                                Pour en savoir plus, consultez notre <Link href="/legal/privacy-policy" className="underline hover:text-white">Politique de Confidentialité</Link>.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={handleDecline}
                                className="flex-1 md:flex-none px-4 py-2 bg-transparent border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                Continuer sans accepter
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-sm font-bold shadow-lg shadow-blue-900/20 whitespace-nowrap"
                            >
                                Accepter tout
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
