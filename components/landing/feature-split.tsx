import Image from 'next/image'
import Link from 'next/link'

export function FeatureSplit() {
    return (
        <section className="bg-white py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24">

                {/* Text Side (50%) */}
                <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                        Visibilité totale. <br />
                        Zéro angle mort.
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                        Suivez vos agents en temps réel. Rapports de ronde numériques et horodatés. La transparence est notre standard.
                    </p>
                    <Link
                        href="/dashboard-demo"
                        className="text-black font-semibold text-lg border-b-2 border-black pb-1 hover:text-gray-700 hover:border-gray-500 transition-all"
                    >
                        Découvrir le dashboard
                    </Link>
                </div>

                {/* Image Side (50%) */}
                <div className="w-full md:w-1/2">
                    <div className="relative aspect-square md:aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                        {/* Placeholder for the dashboard image generated */}
                        <Image
                            src="/vard_dashboard_map_ui_1768928060831.png"
                            alt="Interface Dashboard VARD - Carte temps réel"
                            fill
                            className="object-cover object-center"
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}
