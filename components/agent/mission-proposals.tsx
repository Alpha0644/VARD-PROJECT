'use client'

import { useEffect, useState } from 'react'

type Notification = {
    id: string
    mission: {
        id: string
        title: string
        location: string
        startTime: string
        company: { companyName: string }
    }
}

export function MissionProposals() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/agent/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 5 seconds for new missions
        const interval = setInterval(fetchNotifications, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleRespond = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        setLoading(true)
        try {
            await fetch('/api/agent/notifications/respond', {
                method: 'POST',
                body: JSON.stringify({ notificationId: id, status }),
                headers: { 'Content-Type': 'application/json' }
            })
            // Remove from list locally
            setNotifications(prev => prev.filter(n => n.id !== id))
            alert(status === 'ACCEPTED' ? 'Mission acceptée ! 🚀' : 'Mission refusée.')
        } catch (e) {
            alert('Erreur action')
        } finally {
            setLoading(false)
        }
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                Aucune nouvelle proposition de mission pour le moment.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
                📬 Propositions Reçues
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {notifications.length}
                </span>
            </h3>

            {notifications.map(notif => (
                <div key={notif.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-lg">{notif.mission.title}</h4>
                            <p className="text-sm text-gray-600 font-medium">{notif.mission.company.companyName}</p>
                            <div className="mt-2 text-sm text-gray-500 space-y-1">
                                <p>📍 {notif.mission.location}</p>
                                <p>🕒 {new Date(notif.mission.startTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            disabled={loading}
                            onClick={() => handleRespond(notif.id, 'ACCEPTED')}
                            className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800"
                        >
                            ACCEPTER
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleRespond(notif.id, 'REJECTED')}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50"
                        >
                            Refuser
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
