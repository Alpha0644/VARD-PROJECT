"use client"

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import { auth } from '@/lib/auth'

export default function DebugPusherPage() {
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState('Disconnected')
    const [socketId, setSocketId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('')
    const [channelName, setChannelName] = useState<string>('')

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])

    useEffect(() => {
        // Fetch user ID first (usually we'd get this from session properly, but for debug page we fetch from API or passed prop)
        // Here we assume we are navigating to it as an authenticated agent.
        // We'll fetch a simple "whoami" or assume the user knows their ID for now, 
        // OR better: we make this page server rendered to get session, but Pusher is client only.

        // Let's use a server action or just fetch from an API endpoint if we had one.
        // For now, let's ask the user to input their ID or we try to grab it from a hypothetical API.
        // Actually, let's make the page hybrid. 

        // Wait, 'pusherClient' is global.

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
        })

        channel.bind('pusher:subscription_error', (status: any) => {
            addLog(`❌ SUBSCRIPTION ERROR: ${JSON.stringify(status)}`)
            if (status?.status === 403) addLog('Hints: Auth failed. Check /api/pusher/auth route and cookies.')
            if (status?.status === 404) addLog('Hints: Auth route not found. Check authEndpoint config.')
        })

        channel.bind('mission:new', (data: any) => {
            addLog(`🎉 EVENT RECEIVED: ${JSON.stringify(data)}`)
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
            audio.play()
        })
    }

    return (
        <div className="p-8 max-w-2xl mx-auto font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">🕵️ Pusher Diagnostic</h1>

            <div className="bg-gray-100 p-4 rounded mb-4 space-y-2">
                <div><strong>Status:</strong> <span className={status === 'connected' ? 'text-green-600' : 'text-red-600'}>{status}</span></div>
                <div><strong>Socket ID:</strong> {socketId || 'Waiting...'}</div>
                <div><strong>Key (Public):</strong> {process.env.NEXT_PUBLIC_PUSHER_KEY}</div>
                <div><strong>Cluster:</strong> {process.env.NEXT_PUBLIC_PUSHER_CLUSTER}</div>
            </div>

            <div className="mb-4 flex gap-2">
                <input
                    className="border p-2 flex-1 text-black"
                    placeholder="Enter Channel (e.g. private-user-uuid)"
                    value={channelName}
                    onChange={e => setChannelName(e.target.value)}
                />
                <button
                    onClick={subscribe}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Subscribe
                </button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded h-96 overflow-auto">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    )
}
