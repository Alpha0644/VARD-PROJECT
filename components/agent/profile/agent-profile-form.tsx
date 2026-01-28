'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Save, Loader2, MapPin, Shield } from 'lucide-react'
import Image from 'next/image'

interface AgentProfileFormProps {
    initialData: {
        bio: string | null
        specialties: string[]
        operatingRadius: number | null
        image: string | null
        name: string | null
    }
}

// Common security specialties in France
const SPECIALTIES_LIST = [
    'SSIAP 1', 'SSIAP 2', 'SSIAP 3',
    'CQP APS',
    'Agent Cynophile',
    'Protection Rapprochée',
    'Evénementiel',
    'Luxe',
    'Rondier',
    'Intervenant',
    'Opérateur Vidéo'
]

export function AgentProfileForm({ initialData }: AgentProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        bio: initialData.bio || '',
        operatingRadius: initialData.operatingRadius || 50,
        specialties: initialData.specialties || []
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData.image)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const toggleSpecialty = (spec: string) => {
        setFormData(prev => {
            if (prev.specialties.includes(spec)) {
                return { ...prev, specialties: prev.specialties.filter(s => s !== spec) }
            } else {
                return { ...prev, specialties: [...prev.specialties, spec] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Upload Image if changed
            let imageUrl = initialData.image

            if (imageFile) {
                const formData = new FormData()
                formData.append('file', imageFile)
                // Use a 'avatar' type or generic
                formData.append('type', 'AVATAR')

                // We use existing upload route but might need to adjust it if it strictly checks 'type' enum
                // Checking upload route in memory: it saves to 'db.document'. 
                // We might want a separate 'api/user/avatar' or similar, but for MVP let's reuse api/upload or implement a specific server action.
                // Actually, let's create a server action for profile update that handles image upload differently or separate.

                // START SIMPLIFICATION: We'll do a simple FormData POST to a new API route /api/agent/profile
                // Or better, use Client->Server action pattern.
            }

            // Using fetch to a new API route wrapper
            const submissionData = new FormData()
            submissionData.append('bio', formData.bio)
            submissionData.append('operatingRadius', formData.operatingRadius.toString())
            submissionData.append('specialties', JSON.stringify(formData.specialties))
            if (imageFile) {
                submissionData.append('image', imageFile)
            }

            const res = await fetch('/api/agent/profile', {
                method: 'PATCH',
                body: submissionData,
            })

            if (!res.ok) throw new Error('Erreur sauvegarde')

            router.refresh()
            // Success toast could go here
        } catch (error) {
            console.error(error)
            alert('Erreur lors de la sauvegarde')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm bg-gray-100 relative">
                        {imagePreview ? (
                            <Image
                                src={imagePreview}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Camera className="w-10 h-10" />
                            </div>
                        )}

                        {/* Overlay for upload */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-8 h-8 text-white" />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Cliquez pour modifier</p>
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    À propos de vous
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Décrivez votre expérience, vos points forts..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
            </div>

            {/* Specialties */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Spécialités / Certifications
                </label>
                <div className="flex flex-wrap gap-2">
                    {SPECIALTIES_LIST.map(spec => {
                        const isSelected = formData.specialties.includes(spec)
                        return (
                            <button
                                key={spec}
                                type="button"
                                onClick={() => toggleSpecialty(spec)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                {spec}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Operating Radius */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Rayon d'action ({formData.operatingRadius} km)
                </label>
                <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={formData.operatingRadius}
                    onChange={(e) => setFormData({ ...formData, operatingRadius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5 km</span>
                    <span>200 km</span>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base font-medium shadow-lg shadow-gray-200"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    )
}
