'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { ArrowLeft, MapPin, Calendar, Clock, Users, Euro, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Mission types with pricing per hour
const MISSION_TYPES = [
    { id: 'gardiennage', label: 'Gardiennage', pricePerHour: 25, icon: '🏢' },
    { id: 'ronde', label: 'Ronde de surveillance', pricePerHour: 30, icon: '🔄' },
    { id: 'intervention', label: 'Intervention', pricePerHour: 45, icon: '⚡' },
    { id: 'evenement', label: 'Événement', pricePerHour: 35, icon: '🎉' },
    { id: 'transport', label: 'Transport de fonds', pricePerHour: 55, icon: '💰' },
]

interface FormData {
    title: string
    description: string
    missionType: string
    location: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    agentsNeeded: number
}

export default function NewMissionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        missionType: 'gardiennage',
        location: '',
        startDate: '',
        startTime: '08:00',
        endDate: '',
        endTime: '18:00',
        agentsNeeded: 1,
    })

    // Calculate duration and price
    const calculateDurationAndPrice = () => {
        if (!formData.startDate || !formData.endDate) return { hours: 0, price: 0 }

        const start = new Date(`${formData.startDate}T${formData.startTime}`)
        const end = new Date(`${formData.endDate}T${formData.endTime}`)
        const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))

        const missionTypeData = MISSION_TYPES.find(t => t.id === formData.missionType)
        const pricePerHour = missionTypeData?.pricePerHour || 25
        const price = hours * pricePerHour * formData.agentsNeeded

        return { hours: Math.round(hours * 10) / 10, price: Math.round(price * 100) / 100 }
    }

    const { hours, price } = calculateDurationAndPrice()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'agentsNeeded' ? parseInt(value) || 1 : value
        }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validation
        if (!formData.title.trim()) {
            setError('Le titre est requis')
            setLoading(false)
            return
        }

        if (!formData.location.trim()) {
            setError('L\'adresse est requise')
            setLoading(false)
            return
        }

        if (!formData.startDate || !formData.endDate) {
            setError('Les dates sont requises')
            setLoading(false)
            return
        }

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

        if (endDateTime <= startDateTime) {
            setError('La date de fin doit être après la date de début')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/missions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || undefined,
                    location: formData.location,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    // Default Paris coordinates for MVP
                    latitude: 48.8566,
                    longitude: 2.3522,
                    requirements: [formData.missionType],
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setSuccess(true)
                setTimeout(() => {
                    router.push('/company/missions')
                }, 2000)
            } else {
                const data = await res.json()
                setError(data.error || 'Erreur lors de la création')
            }
        } catch {
            setError('Erreur réseau')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <B2BLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mission créée !</h2>
                        <p className="text-gray-500">Les agents à proximité ont été notifiés.</p>
                    </div>
                </div>
            </B2BLayout>
        )
    }

    return (
        <B2BLayout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/company/missions"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux missions
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Nouvelle Mission</h1>
                    <p className="text-gray-500 mt-1">Créez une mission et trouvez des agents disponibles</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900">Informations générales</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Titre de la mission *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Gardiennage chantier de nuit"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de mission
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {MISSION_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, missionType: type.id }))}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${formData.missionType === type.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{type.icon}</span>
                                        <p className="font-medium text-gray-900 mt-1">{type.label}</p>
                                        <p className="text-sm text-gray-500">{type.pricePerHour}€/h</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (optionnel)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Décrivez les détails de la mission, les exigences particulières..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Lieu de la mission
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse complète *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: 15 Rue de la Paix, 75002 Paris"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Date et horaires
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de début *
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure de début
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de fin *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Heure de fin
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agents */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            Effectifs
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre d&apos;agents requis
                            </label>
                            <select
                                name="agentsNeeded"
                                value={formData.agentsNeeded}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <option key={n} value={n}>{n} agent{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                        <h2 className="font-semibold flex items-center gap-2 mb-4">
                            <Euro className="w-5 h-5" />
                            Estimation du coût
                        </h2>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-blue-100">Durée</span>
                                <span className="font-medium">{hours} heures</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-100">Agents</span>
                                <span className="font-medium">{formData.agentsNeeded}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-100">Tarif horaire</span>
                                <span className="font-medium">
                                    {MISSION_TYPES.find(t => t.id === formData.missionType)?.pricePerHour || 25}€/h
                                </span>
                            </div>
                            <div className="border-t border-blue-500 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg">Total estimé</span>
                                    <span className="text-3xl font-bold">{price.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Link
                            href="/company/missions"
                            className="flex-1 py-3 px-6 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-center font-medium transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Création...' : 'Créer la mission'}
                        </button>
                    </div>
                </form>
            </div>
        </B2BLayout>
    )
}
