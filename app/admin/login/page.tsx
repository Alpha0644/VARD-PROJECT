'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Accès refusé. Vérifiez vos identifiants.')
                setIsLoading(false)
                return
            }

            // Force hard redirect to ensure middleware handles role check
            window.location.href = '/admin'
        } catch {
            setError('Une erreur est survenue.')
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout>
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6"
                    >
                        <ShieldCheck className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
                    <p className="text-gray-500">Accès réservé au personnel autorisé</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Administrateur</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-red-500 focus:ring-red-500 transition-colors"
                                placeholder="admin@vard.test"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-red-500 focus:ring-red-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        {isLoading ? 'Vérification...' : 'Accéder au Dashboard'}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Toute tentative d'accès non autorisé sera enregistrée.
                    </p>
                </form>
            </div>
        </AuthLayout>
    )
}
