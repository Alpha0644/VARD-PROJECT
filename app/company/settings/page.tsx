import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { B2BLayout } from '@/components/company/b2b-layout'
import { Settings, Building2, Bell, Shield, CreditCard, Users } from 'lucide-react'
import Link from 'next/link'

export default async function CompanySettingsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'COMPANY') {
        redirect('/login')
    }

    const settingsCategories = [
        {
            title: 'Entreprise',
            description: 'Informations de votre société',
            icon: <Building2 className="w-6 h-6" />,
            href: '/company/settings/company',
            color: 'blue',
        },
        {
            title: 'Notifications',
            description: 'Gérez vos préférences de notifications',
            icon: <Bell className="w-6 h-6" />,
            href: '/company/settings/notifications',
            color: 'amber',
        },
        {
            title: 'Sécurité',
            description: 'Mot de passe et authentification',
            icon: <Shield className="w-6 h-6" />,
            href: '/company/settings/security',
            color: 'green',
        },
        {
            title: 'Facturation',
            description: 'Méthodes de paiement et facturation',
            icon: <CreditCard className="w-6 h-6" />,
            href: '/company/settings/billing',
            color: 'purple',
        },
        {
            title: 'Équipe',
            description: 'Gérez les accès de votre équipe',
            icon: <Users className="w-6 h-6" />,
            href: '/company/settings/team',
            color: 'cyan',
        },
    ]

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        cyan: 'bg-cyan-100 text-cyan-600',
    }

    return (
        <B2BLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-gray-500 mt-1">Gérez les paramètres de votre compte entreprise</p>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {settingsCategories.map((category) => (
                        <Link
                            key={category.title}
                            href={category.href}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                                {category.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {category.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium text-gray-900">{session.user.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">Nom</span>
                            <span className="font-medium text-gray-900">{session.user.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600">Type de compte</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Entreprise</span>
                        </div>
                    </div>
                </div>
            </div>
        </B2BLayout>
    )
}
