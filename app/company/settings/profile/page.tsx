import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CompanyProfileForm } from '@/components/company/settings/company-profile-form'

export default async function CompanyProfilePage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const company = await db.company.findUnique({
        where: { userId: session.user.id }
    })

    if (!company) redirect('/login')

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-8 mb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Profil Entreprise</h1>
                    <p className="text-gray-500 mt-2 text-lg">Gérez l'image de marque de votre agence visible par les agents.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <CompanyProfileForm
                        initialData={{
                            companyName: company.companyName,
                            siren: company.siren,
                            address: company.address,
                            description: company.description,
                            website: company.website,
                            logoUrl: company.logoUrl
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
