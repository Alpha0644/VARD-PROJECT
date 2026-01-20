'use client'

import Link from 'next/link'
import { Linkedin, Mail, Twitter, Facebook, Instagram } from 'lucide-react'
import { BRAND, FOOTER_LINKS } from '@/lib/constants/landing'

// ============================================================================
// Footer Component - OMEGA Compliant
// Multi-column layout with social links and legal links - Uber Style
// ============================================================================

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-black text-white pt-24 pb-12">
            <div className="section-container">

                {/* Top Section: Logo & Links */}
                <div className="grid md:grid-cols-12 gap-12 mb-20">

                    {/* Brand Column (4 cols) */}
                    <div className="md:col-span-4 flex flex-col items-start">
                        <Link href="/" className="text-2xl font-bold tracking-tight mb-8">
                            {BRAND.name}
                        </Link>
                        <Link href="/help" className="text-white hover:underline mb-8">
                            Centre d aide
                        </Link>
                    </div>

                    {/* Links Columns (8 cols split into 3) */}
                    <div className="md:col-span-8 flex flex-col md:flex-row gap-12 md:gap-20">

                        {/* Products / Agents */}
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-6">Produits</h3>
                            <ul className="space-y-4 text-gray-400">
                                <li><Link href="/" className="hover:text-white transition-colors">Pour les entreprises</Link></li>
                                <li><Link href="/" className="hover:text-white transition-colors">Pour les agents</Link></li>
                                <li><Link href="/" className="hover:text-white transition-colors">Nos services</Link></li>
                            </ul>
                        </div>

                        {/* Global citizenship */}
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-6">Citoyenneté</h3>
                            <ul className="space-y-4 text-gray-400">
                                <li><Link href="/" className="hover:text-white transition-colors">Sécurité</Link></li>
                                <li><Link href="/" className="hover:text-white transition-colors">Diversité et inclusion</Link></li>
                                <li><Link href="/" className="hover:text-white transition-colors">Carrières</Link></li>
                            </ul>
                        </div>

                        {/* Legal Column */}
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-6">Légal</h3>
                            <ul className="space-y-4 text-gray-400">
                                {FOOTER_LINKS.legal.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar: Socials & Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">

                    {/* Social Icons - Uber Style (square-ish) */}
                    <div className="flex gap-6 mb-8 md:mb-0">
                        <a href="#" className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                            <Facebook className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                            <Twitter className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                            <Instagram className="w-5 h-5 text-white" />
                        </a>
                        <a href="#" className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                            <Linkedin className="w-5 h-5 text-white" />
                        </a>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500">
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-white">Confidentialité</Link>
                            <Link href="#" className="hover:text-white">Accessibilité</Link>
                            <Link href="#" className="hover:text-white">Conditions</Link>
                        </div>
                        <p>
                            &copy; {currentYear} {BRAND.name} Technologies Inc.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

