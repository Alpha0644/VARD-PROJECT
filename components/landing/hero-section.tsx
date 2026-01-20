'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Shield, Calendar, Signal } from 'lucide-react'
import { BRAND } from '@/lib/constants/landing'

// ============================================================================
// Hero Section Component - OMEGA Compliant
// "Uber-like" Design: Massive background + Floating white card with tabs
// ============================================================================

export function HeroSection() {
    const [activeTab, setActiveTab] = useState<'CLIENT' | 'AGENT'>('CLIENT')

    return (
        <section id="hero" className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-black">

            {/* Background Image - Massive & Cinematic */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/security_agent_urban_background_1768927092224.png')`, // To be replaced with real asset path
                }}
            >
                {/* Dark Overlay for contrast */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Container - Card on the Left */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">

                {/* Floating White Card */}
                <div className="bg-white max-w-xl w-full p-8 md:p-10 rounded-lg shadow-2xl animate-fade-in-up">

                    {/* Tabs: Client | Agent */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            onClick={() => setActiveTab('CLIENT')}
                            className={`flex-1 pb-4 text-center text-lg font-semibold transition-colors ${activeTab === 'CLIENT'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Entreprise
                        </button>
                        <button
                            onClick={() => setActiveTab('AGENT')}
                            className={`flex-1 pb-4 text-center text-lg font-semibold transition-colors ${activeTab === 'AGENT'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Agent
                        </button>
                    </div>

                    {/* Dynamic Content based on Tab */}
                    <div className="space-y-6">

                        {/* Title - H1 Bold */}
                        <h1 className="text-4xl md:text-5xl font-extrabold text-black leading-tight tracking-tight">
                            {activeTab === 'CLIENT'
                                ? 'Commandez la sécurité, maintenant.'
                                : 'Gagnez plus en sécurisant des sites.'}
                        </h1>

                        {/* Icons Row */}
                        <div className="flex gap-8 py-2">
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <Shield className="w-6 h-6 text-black" />
                                </div>
                                <span className="text-xs font-medium text-gray-600">Gardiennage</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <Signal className="w-6 h-6 text-black" />
                                </div>
                                <span className="text-xs font-medium text-gray-600">Intervention</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <Calendar className="w-6 h-6 text-black" />
                                </div>
                                <span className="text-xs font-medium text-gray-600">Événementiel</span>
                            </div>
                        </div>

                        {/* Input Field - Uber Style */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-black" />
                            </div>
                            <input
                                type="text"
                                placeholder={activeTab === 'CLIENT' ? "Lieu de la mission ?" : "Votre ville ?"}
                                className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-lg text-black font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            />
                        </div>

                        {/* CTA Button - Black Full Width */}
                        <Link
                            href={activeTab === 'CLIENT' ? '/login?role=COMPANY' : '/register?role=AGENT'}
                            className="block"
                        >
                            <button className="w-full bg-black text-white font-bold text-lg py-4 rounded-lg hover:bg-gray-900 transition-all active:scale-[0.99]">
                                {activeTab === 'CLIENT' ? 'Voir les agents' : 'Devenir Agent VARD'}
                            </button>
                        </Link>

                    </div>
                </div>
            </div>
        </section>
    )
}
