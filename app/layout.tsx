import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import './globals.css'
import { CookieBanner } from '@/components/gdpr/cookie-banner'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
    title: 'OMEGA - Uber for Security',
    description: 'Platform de mise en relation agents de sécurité / entreprises',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr">
            <body>
                {children}
                <CookieBanner />
                <Analytics />
                <Toaster />
            </body>
        </html>
    )
}
