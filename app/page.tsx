import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-5xl mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        🛡️ VARD Security
                    </h1>
                    <p className="text-xl text-gray-600">
                        Plateforme de mise en relation <span className="font-semibold">Agents de Sécurité</span> et <span className="font-semibold">Entreprises</span>
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">

                    {/* Agent Card */}
                    <Link
                        href="/login"
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
                    >
                        <div className="text-center">
                            <div className="mb-6 text-6xl">🛡️</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Je suis un Agent
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Accédez aux missions de sécurité disponibles et gérez vos interventions
                            </p>
                            <div className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Accéder au dashboard →
                            </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                            Agent de sécurité
                        </div>
                    </Link>

                    {/* Company Card */}
                    <Link
                        href="/login"
                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500"
                    >
                        <div className="text-center">
                            <div className="mb-6 text-6xl">🏢</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Je suis une Entreprise
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Créez des missions et trouvez des agents qualifiés rapidement
                            </p>
                            <div className="inline-flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Accéder au dashboard →
                            </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                            Entreprise
                        </div>
                    </Link>

                </div>

                {/* Admin Link (discreet) */}
                <div className="text-center">
                    <Link
                        href="/admin"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Administration
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-sm text-gray-500">
                    <p>Besoin d'un compte ? <Link href="/register" className="text-blue-600 hover:underline">S'inscrire</Link></p>
                </div>

            </div>
        </div>
    )
}
