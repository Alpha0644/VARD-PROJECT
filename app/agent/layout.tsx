import { auth } from '@/lib/auth'
import { AgentLayoutClient } from '@/components/agent/layout/agent-layout-client'
import { AgentNotificationManager } from '@/components/agent/agent-notification-manager'

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
            {userId && <AgentNotificationManager userId={userId} />}
            {children}
        </AgentLayoutClient>
    )
}

