'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * RGPD Cookie Consent Banner
 * Compliant with ePrivacy Directive
 */
export function CookieBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent')
        if (!consent) {
            setShow(true)
        }
    }, [])

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'accepted')
        setShow(false)
    }

    const rejectCookies = () => {
        localStorage.setItem('cookieConsent', 'rejected')
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm">
                        🍪 Nous utilisons des <strong>cookies essentiels</strong> pour le fonctionnement du site (authentification uniquement).
                        Aucun tracking publicitaire.{' '}
                        <Link href="/privacy-policy" className="underline hover:text-blue-300">
                            En savoir plus
                        </Link>
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={rejectCookies}
                        className="px-4 py-2 border border-gray-500 rounded-md text-sm hover:bg-gray-800 transition"
                    >
                        Refuser
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm hover:bg-blue-700 transition"
                    >
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    )
}
