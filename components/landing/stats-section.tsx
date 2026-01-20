'use client'

import { useEffect, useRef, useState } from 'react'
import { STATS } from '@/lib/constants/landing'

// ============================================================================
// Stats Section - OMEGA Compliant
// Animated counters using IntersectionObserver - "Uber-like" Dark Theme
// ============================================================================

export function StatsSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="section bg-black text-white py-16 md:py-24"
            aria-label="Statistiques de la plateforme"
        >
            <div className="section-container">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                    {STATS.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`text-center px-4 pt-8 md:pt-0 transition-all duration-700 ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                                }`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                                {stat.value}
                                {stat.suffix && <span className="text-3xl ml-1 text-gray-500">{stat.suffix}</span>}
                            </div>
                            <p className="text-gray-400 font-medium text-sm md:text-base uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
