import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AgentProfileForm } from '@/components/agent/profile/agent-profile-form'

export default async function AgentProfileEditPage() {
    const session = await auth()

    if (!session || session.user.role !== 'AGENT') {
        redirect('/login')
    }

    const agent = await db.agent.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true
        }
    })

    if (!agent) redirect('/login')

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-6 mb-6">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                    <p className="text-gray-500 mt-1">Gérez vos informations publiques et vos compétences.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <AgentProfileForm
                        initialData={{
                            bio: agent.bio,
                            specialties: agent.specialties,
                            operatingRadius: agent.operatingRadius,
                            image: agent.user.image,
                            name: agent.user.name
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
