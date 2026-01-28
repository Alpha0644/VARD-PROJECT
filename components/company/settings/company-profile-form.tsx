'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Save, Loader2, MapPin, Globe, FileText, Camera } from 'lucide-react'
import Image from 'next/image'

interface CompanyProfileFormProps {
    initialData: {
        companyName: string
        siren: string
        address: string | null
        description: string | null
        website: string | null
        logoUrl: string | null
    }
}

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        companyName: initialData.companyName || '',
        address: initialData.address || '',
        description: initialData.description || '',
        website: initialData.website || ''
    })

    // Logo state
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl)

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const submissionData = new FormData()
            submissionData.append('companyName', formData.companyName)
            submissionData.append('address', formData.address)
            submissionData.append('description', formData.description)
            submissionData.append('website', formData.website)

            if (logoFile) {
                submissionData.append('logo', logoFile)
            }

            const res = await fetch('/api/company/profile', {
                method: 'PATCH',
                body: submissionData,
            })

            if (!res.ok) throw new Error('Erreur sauvegarde')

            router.refresh()
            // Could add toast here
        } catch (error) {
            console.error(error)
            alert('Erreur lors de la sauvegarde du profil')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-gray-100 shadow-sm bg-white relative flex items-center justify-center">
                        {logoPreview ? (
                            <Image
                                src={logoPreview}
                                alt="Logo"
                                fill
                                className="object-contain p-2"
                            />
                        ) : (
                            <Building2 className="w-12 h-12 text-gray-300" />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                            <div className="flex flex-col items-center gap-1">
                                <Camera className="w-6 h-6" />
                                <span>Modifier</span>
                            </div>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Logo de l'entreprise</p>
                </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="VARD Sécurité"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro SIREN
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={initialData.siren} // Read-only usually
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Le SIREN ne peut pas être modifié.</p>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Présentation de l'entreprise
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Présentez votre agence aux agents (valeurs, spécialités, historique)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse du siège
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="123 Avenue de la République, Paris"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Web
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://www.vard-securite.com"
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-gray-200"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Enregistrer le profil
                </button>
            </div>
        </form>
    )
}
