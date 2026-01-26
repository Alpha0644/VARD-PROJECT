'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthLayout } from '@/components/auth/auth-layout'
import { Eye, EyeOff, Building2, User, Lock, Check } from 'lucide-react'
import {
    formatSirenSiret,
    cleanSirenSiret,
    agentLoginSchema,
    entrepriseLoginSchema,
    fetchCompanySuggestions,
    type CompanySuggestion,
} from '@/features/auth/login-schemas'

interface FieldErrors {
    identifier?: string
    sirenSiret?: string
    userIdentifier?: string
    password?: string
}

type TabType = 'agent' | 'entreprise'
type InputType = 'unknown' | 'email' | 'phone'

// ============================================
// AGENT LOGIN FORM COMPONENT
// ============================================

function AgentLoginForm() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState('')
    const [inputType, setInputType] = useState<InputType>('unknown')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [shakingFields, setShakingFields] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

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
        if (fieldErrors.identifier) {
            setFieldErrors(prev => ({ ...prev, identifier: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const result = agentLoginSchema.safeParse({ identifier, password })

        if (!result.success) {
            const errors: FieldErrors = {}
            const fieldsToShake: string[] = []

            result.error.errors.forEach(err => {
                const field = err.path[0] as string
                errors[field as keyof FieldErrors] = err.message
                fieldsToShake.push(field)
            })

            setFieldErrors(errors)
            setShakingFields(fieldsToShake)
            setTimeout(() => setShakingFields([]), 500)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email: inputType === 'email' ? identifier : undefined,
                phone: inputType === 'phone' ? identifier.replace(/\s/g, '') : undefined,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Identifiant ou mot de passe incorrect')
                setIsLoading(false)
                return
            }

            router.push('/agent/dashboard')
            router.refresh()
        } catch {
            setError('Une erreur est survenue')
            setIsLoading(false)
        }
    }

    const getInputClassName = (fieldName: string, extra: string = '') => {
        const base = "w-full pl-12 pr-4 h-12 bg-gray-100 rounded-lg border-2 focus:bg-white focus:outline-none transition-all text-black placeholder:text-gray-400"
        const hasError = fieldErrors[fieldName as keyof FieldErrors]
        const isShaking = shakingFields.includes(fieldName)

        return `${base} ${extra} ${hasError ? 'border-red-500' : 'border-transparent focus:border-black'} ${isShaking ? 'animate-shake' : ''}`
    }

    return (
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
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="agent-identifier"
                        name="identifier"
                        type="text"
                        inputMode={inputType === 'email' ? 'email' : inputType === 'phone' ? 'numeric' : 'text'}
                        autoComplete="username"
                        value={identifier}
                        onChange={handleIdentifierChange}
                        className={getInputClassName('identifier')}
                        placeholder="agent@email.com ou 06 12 34 56 78"
                    />
                </div>
                {fieldErrors.identifier && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.identifier}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        id="agent-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            if (fieldErrors.password) {
                                setFieldErrors(prev => ({ ...prev, password: undefined }))
                            }
                        }}
                        className={getInputClassName('password', 'pr-12')}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
                )}
            </div>

            <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black underline">
                    Mot de passe oublié ?
                </Link>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white h-12 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
                {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
        </form>
    )
}

// ============================================
// ENTREPRISE LOGIN FORM COMPONENT
// ============================================

function EntrepriseLoginForm() {
    const router = useRouter()
    const [sirenSiret, setSirenSiret] = useState('')
    const [userIdentifier, setUserIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberSiret, setRememberSiret] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [shakingFields, setShakingFields] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<CompanySuggestion | null>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Load remembered SIRET on mount
    useEffect(() => {
        const saved = localStorage.getItem('rememberedSiret')
        if (saved) {
            setSirenSiret(formatSirenSiret(saved))
            setRememberSiret(true)
        }
    }, [])

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch suggestions when SIRET changes
    const fetchSuggestions = useCallback(async (query: string) => {
        const cleaned = cleanSirenSiret(query)
        if (cleaned.length >= 3) {
            const results = await fetchCompanySuggestions(cleaned)
            setSuggestions(results)
            setShowSuggestions(results.length > 0)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [])

    const handleSirenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatSirenSiret(e.target.value)
        setSirenSiret(formatted)
        setSelectedCompany(null)
        fetchSuggestions(formatted)

        if (fieldErrors.sirenSiret) {
            setFieldErrors(prev => ({ ...prev, sirenSiret: undefined }))
        }
    }

    const selectCompany = (company: CompanySuggestion) => {
        setSirenSiret(formatSirenSiret(company.siret))
        setSelectedCompany(company)
        setShowSuggestions(false)
    }

    const validateForm = (): boolean => {
        const result = entrepriseLoginSchema.safeParse({
            sirenSiret,
            userIdentifier,
            password,
            rememberSiret,
        })

        if (!result.success) {
            const errors: FieldErrors = {}
            const fieldsToShake: string[] = []

            result.error.errors.forEach(err => {
                const field = err.path[0] as string
                errors[field as keyof FieldErrors] = err.message
                fieldsToShake.push(field)
            })

            setFieldErrors(errors)
            setShakingFields(fieldsToShake)
            setTimeout(() => setShakingFields([]), 500)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!validateForm()) return

        // Save/remove SIRET from localStorage
        if (rememberSiret) {
            localStorage.setItem('rememberedSiret', cleanSirenSiret(sirenSiret))
        } else {
            localStorage.removeItem('rememberedSiret')
        }

        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                siret: cleanSirenSiret(sirenSiret),
                email: userIdentifier,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Identifiants incorrects')
                setIsLoading(false)
                return
            }

            router.push('/company/dashboard')
            router.refresh()
        } catch {
            setError('Une erreur est survenue')
            setIsLoading(false)
        }
    }

    const getInputClassName = (fieldName: string, extra: string = '') => {
        const base = "w-full pl-12 pr-4 h-12 bg-gray-50 rounded-lg border-2 focus:bg-white focus:outline-none transition-all text-black placeholder:text-gray-400"
        const hasError = fieldErrors[fieldName as keyof FieldErrors]
        const isShaking = shakingFields.includes(fieldName)

        return `${base} ${extra} ${hasError ? 'border-red-500' : 'border-gray-200 focus:border-[#1e3a5f]'} ${isShaking ? 'animate-shake' : ''}`
    }

    return (
        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* SIREN/SIRET with Autocomplete */}
                <div className="relative" ref={suggestionsRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Identifiant Société (SIREN/SIRET)
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="entreprise-siret"
                            name="siret"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={sirenSiret}
                            onChange={handleSirenChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            className={getInputClassName('sirenSiret')}
                            placeholder="123 456 789 ou 123 456 789 00012"
                        />
                    </div>
                    {fieldErrors.sirenSiret && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors.sirenSiret}</p>
                    )}

                    {/* Selected company info */}
                    {selectedCompany && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="font-medium text-green-800">{selectedCompany.name}</p>
                            <p className="text-sm text-green-600">
                                {selectedCompany.address}, {selectedCompany.postalCode} {selectedCompany.city}
                            </p>
                        </div>
                    )}

                    {/* Autocomplete suggestions */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                            >
                                {suggestions.map((company) => (
                                    <button
                                        key={company.siret}
                                        type="button"
                                        onClick={() => selectCompany(company)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                    >
                                        <p className="font-medium text-gray-900">{company.name}</p>
                                        <p className="text-sm text-gray-500">
                                            SIRET: {formatSirenSiret(company.siret)} • {company.city}
                                        </p>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Identifier */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Identifiant Utilisateur
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="entreprise-identifier"
                            name="userIdentifier"
                            type="text"
                            inputMode="email"
                            autoComplete="username"
                            value={userIdentifier}
                            onChange={(e) => {
                                setUserIdentifier(e.target.value)
                                if (fieldErrors.userIdentifier) {
                                    setFieldErrors(prev => ({ ...prev, userIdentifier: undefined }))
                                }
                            }}
                            className={getInputClassName('userIdentifier')}
                            placeholder="Email pro ou Téléphone"
                        />
                    </div>
                    {fieldErrors.userIdentifier && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors.userIdentifier}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="entreprise-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (fieldErrors.password) {
                                    setFieldErrors(prev => ({ ...prev, password: undefined }))
                                }
                            }}
                            className={getInputClassName('password', 'pr-12')}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1e3a5f] transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
                    )}
                </div>

                {/* Remember SIRET Checkbox */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setRememberSiret(!rememberSiret)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberSiret
                            ? 'bg-[#1e3a5f] border-[#1e3a5f]'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        {rememberSiret && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <label
                        className="text-sm text-gray-600 cursor-pointer"
                        onClick={() => setRememberSiret(!rememberSiret)}
                    >
                        Se souvenir de mon SIRET
                    </label>
                </div>

                <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-[#1e3a5f] underline">
                        Mot de passe oublié ?
                    </Link>
                </div>

                {/* Navy Blue Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1e3a5f] text-white h-12 rounded-lg hover:bg-[#152c4a] transition-colors disabled:opacity-50 font-medium"
                >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    )
}

// ============================================
// MAIN LOGIN PAGE
// ============================================

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<TabType>('agent')

    const tabs: { id: TabType; label: string }[] = [
        { id: 'agent', label: 'Agent' },
        { id: 'entreprise', label: 'Entreprise' },
    ]

    return (
        <AuthLayout>
            <div>
                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative pb-4 text-lg font-medium transition-colors ${activeTab === tab.id
                                ? 'text-black'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-black"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-black mb-2">
                    {activeTab === 'agent' ? 'Bienvenue' : 'Espace Entreprise'}
                </h1>
                <p className="text-gray-500 mb-8">
                    {activeTab === 'agent'
                        ? 'Connectez-vous pour continuer'
                        : 'Accédez à votre espace professionnel sécurisé'
                    }
                </p>

                {/* Conditional Form */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'agent' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'agent' ? 20 : -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'agent' ? <AgentLoginForm /> : <EntrepriseLoginForm />}
                    </motion.div>
                </AnimatePresence>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400">ou</span>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-gray-500">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="text-black hover:underline font-medium">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    )
}
