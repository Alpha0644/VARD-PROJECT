import { auth } from '@/lib/auth'
import { AgentLayoutClient } from '@/components/agent/layout/agent-layout-client'

export const metadata = {
    title: 'Dashboard Agent | VARD',
    description: 'Espace réservé aux agents de sécurité VARD',
}

export default async function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const userId = session?.user?.id

    return (
        <AgentLayoutClient userId={userId}>
            {children}
        </AgentLayoutClient>
    )
}

