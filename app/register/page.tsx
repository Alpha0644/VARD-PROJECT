'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/auth-layout'
import { CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'AGENT' as 'AGENT' | 'COMPANY',
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue')
                setIsLoading(false)
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err) {
            setError('Une erreur est survenue')
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <AuthLayout>
                <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
                    <h2 className="text-2xl font-bold text-black mb-2">
                        Inscription réussie !
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Vérifiez votre email pour activer votre compte.
                    </p>
                    <p className="text-sm text-gray-400">
                        Redirection vers la connexion...
                    </p>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="text-3xl font-bold text-black mb-2">Inscription</h1>
                <p className="text-gray-500 mb-8">
                    Créez votre compte professionnel
                </p>

                {error && (
                    <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-3">
                            Je suis
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'AGENT' })}
                                className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'AGENT'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-black">Agent</div>
                                <div className="text-sm text-gray-500">de sécurité</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'COMPANY' })}
                                className={`p-4 border-2 rounded-lg transition-all ${formData.role === 'COMPANY'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-black">Entreprise</div>
                                <div className="text-sm text-gray-500">de sécurité</div>
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                            Nom complet
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black placeholder:text-gray-400"
                            placeholder="Jean Dupont"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black placeholder:text-gray-400"
                            placeholder="votre@email.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                            Min. 8 caractères, 1 majuscule, 1 chiffre
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base"
                    >
                        {isLoading ? 'Inscription...' : 'Créer mon compte'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="text-black hover:underline font-medium">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    )
}
