'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import { BRAND } from '@/lib/constants/landing'

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-black text-white h-16 w-full">
            <nav className="h-full px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between">

                {/* Logo Left */}
                <Link href="/" className="font-bold text-xl tracking-tight">
                    VARD
                </Link>

                {/* Desktop Actions Right */}
                <div className="hidden md:flex items-center gap-4">

                    {/* Agent Group */}
                    <Link
                        href="/login?role=AGENT"
                        className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
                    >
                        <User className="w-5 h-5" />
                        <span>Espace Agent</span>
                    </Link>

                    {/* Company Group - White Pill Button */}
                    <Link
                        href="/login?role=COMPANY"
                        className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                        Espace Client
                    </Link>

                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 hover:bg-white/10 rounded-full"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>

            </nav>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-black border-t border-gray-800 p-4 flex flex-col gap-4 md:hidden shadow-xl">
                    <Link
                        href="/login?role=AGENT"
                        className="flex items-center gap-2 hover:bg-white/10 px-4 py-3 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <User className="w-5 h-5" />
                        <span>Espace Agent</span>
                    </Link>
                    <Link
                        href="/login?role=COMPANY"
                        className="bg-white text-black px-4 py-3 rounded-full font-medium text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Espace Client
                    </Link>
                </div>
            )}
        </header>
    )
}
