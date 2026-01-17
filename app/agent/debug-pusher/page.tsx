import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DebugPusherClient } from './client'

export default async function DebugPusherPage() {
    const session = await auth()

    if (!session) {
        return <div className="p-8">🚫 Vous devez être connecté pour voir cette page. <a href="/login" className="text-blue-600 underline">Se connecter</a></div>
    }

    return <DebugPusherClient userId={session.user.id} userName={session.user.name || 'User'} />
}
