import { FileText, Zap, ShieldCheck } from 'lucide-react'

export function QualityAssurance() {
    return (
        <section className="bg-gray-100 py-20 px-4 md:px-8">
            <div className="section-container max-w-7xl mx-auto">
                {/* Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
                        Votre sécurité, notre priorité.
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-12 text-center">

                    {/* Item 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <FileText className="w-8 h-8 text-black" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">
                            Agents Certifiés
                        </h3>
                        <p className="text-gray-600 leading-relaxed max-w-xs">
                            Vérification automatique des cartes pro et agréments préfectoraux.
                        </p>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <Zap className="w-8 h-8 text-black" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">
                            Réactivité 24/7
                        </h3>
                        <p className="text-gray-600 leading-relaxed max-w-xs">
                            Un agent sur site en moins de 2h garanti.
                        </p>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <ShieldCheck className="w-8 h-8 text-black" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">
                            Assurance Incluse
                        </h3>
                        <p className="text-gray-600 leading-relaxed max-w-xs">
                            Chaque mission est couverte par notre RC Pro.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}
