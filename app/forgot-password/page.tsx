'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/components/auth/auth-layout'
import { User, ArrowLeft, Mail, Phone, CheckCircle } from 'lucide-react'

type InputType = 'unknown' | 'email' | 'phone'

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('')
    const [inputType, setInputType] = useState<InputType>('unknown')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Format phone number for display
    const formatPhoneDisplay = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 9)
        return digits.replace(/(\d{1})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/, (_, p1, p2, p3, p4, p5) => {
            return [p1, p2, p3, p4, p5].filter(Boolean).join(' ')
        })
    }

    // Detect input type
    const detectInputType = (value: string): InputType => {
        if (!value.trim()) return 'unknown'
        if (value.includes('@') || /[a-zA-Z]/.test(value)) return 'email'
        if (/^[0-9+]/.test(value)) return 'phone'
        return 'unknown'
    }

    useEffect(() => {
        setInputType(detectInputType(identifier))
    }, [identifier])

    const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        const detected = detectInputType(value)

        if (detected === 'phone') {
            const hasPlus = value.startsWith('+')
            const digits = value.replace(/\D/g, '')

            if (hasPlus && digits.startsWith('33')) {
                value = '+33 ' + formatPhoneDisplay(digits.slice(2))
            } else if (hasPlus) {
                value = '+' + digits
            } else {
                value = formatPhoneDisplay(digits)
            }
        }

        setIdentifier(value)
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Basic validation
        if (!identifier.trim()) {
            setError('Veuillez entrer votre email ou numéro de téléphone')
            return
        }

        if (inputType === 'email' && !identifier.includes('@')) {
            setError('Veuillez entrer une adresse email valide')
            return
        }

        if (inputType === 'phone') {
            const digits = identifier.replace(/\D/g, '')
            if (digits.length < 9) {
                setError('Veuillez entrer un numéro de téléphone valide')
                return
            }
        }

        setIsLoading(true)

        // Simulate API call (replace with actual API when ready)
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsLoading(false)
        setIsSuccess(true)
    }

    // Success state
    if (isSuccess) {
        return (
            <AuthLayout>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-black mb-3">
                        Vérifiez vos messages
                    </h1>

                    <p className="text-gray-500 mb-8">
                        {inputType === 'email' ? (
                            <>
                                Nous avons envoyé un lien de réinitialisation à{' '}
                                <span className="font-medium text-black">{identifier}</span>
                            </>
                        ) : (
                            <>
                                Nous avons envoyé un code par SMS au{' '}
                                <span className="font-medium text-black">{identifier}</span>
                            </>
                        )}
                    </p>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Vous n&apos;avez pas reçu de message ?{' '}
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="text-black underline hover:no-underline"
                            >
                                Réessayer
                            </button>
                        </p>

                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la connexion
                        </Link>
                    </div>
                </motion.div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div>
                {/* Back Link */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </Link>

                {/* Title */}
                <h1 className="text-4xl font-bold text-black mb-2">
                    Mot de passe oublié ?
                </h1>
                <p className="text-gray-500 mb-8">
                    Entrez votre email ou numéro de téléphone et nous vous enverrons un lien de réinitialisation.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Identifier Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email ou Numéro de téléphone
                        </label>
                        <div className="relative">
                            {inputType === 'email' ? (
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            ) : inputType === 'phone' ? (
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            ) : (
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            )}
                            <input
                                id="identifier"
                                type="text"
                                inputMode={inputType === 'email' ? 'email' : inputType === 'phone' ? 'numeric' : 'text'}
                                value={identifier}
                                onChange={handleIdentifierChange}
                                className="w-full pl-12 pr-4 h-12 bg-gray-100 rounded-lg border-2 border-transparent focus:border-black focus:bg-white focus:outline-none transition-all text-black placeholder:text-gray-400"
                                placeholder="agent@email.com ou 06 12 34 56 78"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white h-12 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                    >
                        {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </button>
                </form>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-400 mt-8">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link href="/login" className="text-black underline hover:no-underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </AuthLayout>
    )
}
