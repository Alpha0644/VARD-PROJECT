import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CookieBanner } from '@/components/gdpr/cookie-banner'
import { Toaster } from '@/components/ui/sonner'
import { SEO_METADATA } from '@/lib/constants/landing'

// ============================================================================
// SEO Metadata - OMEGA Compliant
// Centralized in constants, applied here
// ============================================================================
export const metadata: Metadata = {
    metadataBase: new URL(SEO_METADATA.siteUrl),
    title: {
        default: SEO_METADATA.title,
        template: `%s | VARD`,
    },
    description: SEO_METADATA.description,
    keywords: SEO_METADATA.keywords,
    authors: [{ name: 'VARD Team' }],
    creator: 'VARD',
    publisher: 'VARD',

    // Open Graph
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: SEO_METADATA.siteUrl,
        siteName: 'VARD',
        title: SEO_METADATA.title,
        description: SEO_METADATA.description,
        images: [
            {
                url: SEO_METADATA.ogImage,
                width: 1200,
                height: 630,
                alt: 'VARD - Plateforme de sécurité privée',
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: SEO_METADATA.title,
        description: SEO_METADATA.description,
        images: [SEO_METADATA.ogImage],
        creator: SEO_METADATA.twitterHandle,
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Icons
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },

    // Verification (add your IDs when available)
    // verification: {
    //   google: 'your-google-verification-id',
    // },

    // Canonical
    alternates: {
        canonical: SEO_METADATA.siteUrl,
    },
}

// Viewport configuration (separated from metadata in Next.js 14+)
export const viewport: Viewport = {
    themeColor: '#0A1628',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

// ============================================================================
// Root Layout
// ============================================================================
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className="scroll-smooth">
            <body className="min-h-screen bg-white text-vard-dark antialiased">
                {children}
                <CookieBanner />
                <Analytics />
                <Toaster />
            </body>
        </html>
    )
}
