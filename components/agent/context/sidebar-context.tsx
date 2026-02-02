'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleSidebar = () => setIsCollapsed(prev => !prev)

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        // Return default values if not in provider (e.g., mobile where there's no sidebar)
        return { isCollapsed: true, setIsCollapsed: () => { }, toggleSidebar: () => { } }
    }
    return context
}
