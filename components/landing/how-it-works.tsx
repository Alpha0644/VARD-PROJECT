import { UserPlus, Bell, CheckCircle } from 'lucide-react'
import { HOW_IT_WORKS_STEPS } from '@/lib/constants/landing'

// ============================================================================
// How It Works Section - OMEGA Compliant
// 3 steps with icons and descriptions
// ============================================================================

// Icon mapping to avoid dynamic imports
const ICON_MAP = {
    UserPlus: UserPlus,
    Bell: Bell,
    CheckCircle: CheckCircle,
} as const

export function HowItWorksSection() {
    return (
        <section
            id="comment-ca-marche"
            className="section bg-white py-24"
            aria-labelledby="how-it-works-title"
        >
            <div className="section-container">
                {/* Section Header */}
                <header className="mb-16 md:mb-24">
                    <h2 id="how-it-works-title" className="text-3xl md:text-5xl font-bold text-black mb-6">
                        Sécurité à la demande.
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl">
                        Une approche simplifiée pour commander ou proposer des services de sécurité.
                    </p>
                </header>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-12 md:gap-16">
                    {HOW_IT_WORKS_STEPS.map((step, index) => {
                        const IconComponent = ICON_MAP[step.icon as keyof typeof ICON_MAP]

                        return (
                            <article
                                key={step.number}
                                className="relative animate-on-scroll group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Icon Circle - Minimal */}
                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {index + 1}
                                    </div>
                                    <IconComponent
                                        className="w-12 h-12 text-black mb-6"
                                        aria-hidden="true"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-black mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-lg leading-relaxed">
                                    {step.description}
                                </p>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
