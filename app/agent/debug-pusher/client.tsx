"use client"

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'

export function DebugPusherClient({ userId, userName }: { userId: string, userName: string }) {
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState('Disconnected')
    const [socketId, setSocketId] = useState<string | null>(null)
    // Auto-calculate channel based on REAL session ID
    const [channelName, setChannelName] = useState<string>(`private-user-${userId}`)

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])

    useEffect(() => {
        pusherClient.connection.bind('state_change', (states: any) => {
            setStatus(states.current)
            addLog(`Connection state changed: ${states.current}`)
        })

        pusherClient.connection.bind('connected', () => {
            setSocketId(pusherClient.connection.socket_id)
            addLog(`Connected with Socket ID: ${pusherClient.connection.socket_id}`)
        })

        pusherClient.connection.bind('error', (err: any) => {
            addLog(`Connection ERROR: ${JSON.stringify(err)}`)
        })
    }, [])

    const subscribe = () => {
        if (!channelName) return
        addLog(`Attempting to subscribe to: ${channelName}`)

        const channel = pusherClient.subscribe(channelName)

        channel.bind('pusher:subscription_succeeded', () => {
            addLog(`✅ SUBSCRIBED successfully to ${channelName}`)
            addLog(`READY TO RECEIVE EVENTS!`)
        })

        channel.bind('pusher:subscription_error', (status: any) => {
            addLog(`❌ SUBSCRIPTION ERROR: ${JSON.stringify(status)}`)
            if (status?.status === 403) addLog(`⛔ 403 Forbidden: You are logged in as ${userId} but trying to access ${channelName}. Channel name MUST match 'private-user-${userId}'`)
        })

        channel.bind('mission:new', (data: any) => {
            addLog(`🎉 EVENT RECEIVED: ${JSON.stringify(data)}`)
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
            audio.play()
        })
    }

    return (
        <div className="p-8 max-w-2xl mx-auto font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">🕵️ Pusher Diagnostic (Auto-Detect)</h1>

            <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
                <h3 className="font-bold text-blue-800">Votre Session Actuelle :</h3>
                <div>Nom: <strong>{userName}</strong></div>
                <div>ID: <strong>{userId}</strong></div>
                <div className="text-xs text-blue-600 mt-1">Le channel a été pré-rempli avec VOTRE ID. Ne le changez pas sauf si vous savez ce que vous faites.</div>
            </div>

            <div className="bg-gray-100 p-4 rounded mb-4 space-y-2">
                <div><strong>Status:</strong> <span className={status === 'connected' ? 'text-green-600' : 'text-red-600'}>{status}</span></div>
                <div><strong>Socket ID:</strong> {socketId || 'Waiting...'}</div>
            </div>

            <div className="mb-4 flex gap-2">
                <input
                    className="border p-2 flex-1 text-black bg-gray-50"
                    value={channelName}
                    readOnly
                />
                <button
                    onClick={subscribe}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Subscribe (Auto)
                </button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded h-96 overflow-auto">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    )
}
