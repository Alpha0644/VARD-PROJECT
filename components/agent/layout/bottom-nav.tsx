'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, List, User } from 'lucide-react'

export function AgentBottomNav() {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Carte',
            icon: Map,
            href: '/agent/dashboard', // Main map view
        },
        {
            label: 'Missions',
            icon: List,
            href: '/agent/missions',
        },
        {
            label: 'Compte',
            icon: User,
            href: '/agent/profile',
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 pb-safe-area">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
