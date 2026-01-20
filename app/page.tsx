import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeatureSplit } from '@/components/landing/feature-split'
import { QualityAssurance } from '@/components/landing/quality-assurance'
import { StatsSection } from '@/components/landing/stats-section'
import { DownloadAppSection } from '@/components/landing/download-app-section'
import { Footer } from '@/components/landing/footer'

// ============================================================================
// Main Landing Page Structure
// OMEGA Compliant: Composition of smaller components
// ============================================================================

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <HeroSection />

                <StatsSection />

                <FeatureSplit />

                <QualityAssurance />






            </main>

            <DownloadAppSection />

            <Footer />
        </div>
    )
}
