import type { Metadata } from 'next'
import './globals.css'
import { CookieBanner } from '@/components/gdpr/cookie-banner'

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
            </body>
        </html>
    )
}
