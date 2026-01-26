'use client'

import { useState } from 'react'

interface StatusToggleProps {
    onStatusChange?: (isOnline: boolean) => void
}

export function StatusToggle({ onStatusChange }: StatusToggleProps) {
    const [isOnline, setIsOnline] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        const newStatus = !isOnline
        setIsOnline(newStatus)
        setIsLoading(false)

        onStatusChange?.(newStatus)
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`
                    w-24 h-24 rounded-full font-bold text-2xl shadow-lg transition-all duration-300
                    ${isOnline
                        ? 'bg-green-500 text-white ring-4 ring-green-500/30'
                        : 'bg-black text-white ring-4 ring-black/20 animate-pulse'
                    }
                    ${isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105'}
                `}
            >
                {isOnline ? 'ON' : 'GO'}
            </button>
            <p className={`mt-4 font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isLoading
                    ? 'Connexion...'
                    : isOnline
                        ? 'Vous êtes en ligne'
                        : 'Vous êtes hors ligne'
                }
            </p>

            {isOnline && (
                <p className="mt-2 text-xs text-gray-400">
                    En attente de missions...
                </p>
            )}
        </div>
    )
}
