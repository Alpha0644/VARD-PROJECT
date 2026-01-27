'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useRef, useState, useEffect, ReactNode } from 'react'
import { GripHorizontal } from 'lucide-react'

interface BottomSheetProps {
    children: ReactNode
    title?: string
    badge?: number
    defaultState?: 'collapsed' | 'half' | 'full'
}

const COLLAPSED_HEIGHT = 80
const HALF_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400
const FULL_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 700

type SheetState = 'collapsed' | 'half' | 'full'

export function BottomSheet({
    children,
    title = 'Missions disponibles',
    badge,
    defaultState = 'half'
}: BottomSheetProps) {
    const [state, setState] = useState<SheetState>(defaultState)
    const [windowHeight, setWindowHeight] = useState(800)
    const constraintsRef = useRef(null)
    const y = useMotionValue(0)

    useEffect(() => {
        setWindowHeight(window.innerHeight)
        const handleResize = () => setWindowHeight(window.innerHeight)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const collapsedH = 100
    const halfH = windowHeight * 0.45
    const fullH = windowHeight * 0.85

    const getHeightForState = (s: SheetState) => {
        switch (s) {
            case 'collapsed': return collapsedH
            case 'half': return halfH
            case 'full': return fullH
        }
    }

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const velocity = info.velocity.y
        const offset = info.offset.y

        // Fast swipe detection
        if (velocity < -500) {
            // Fast swipe up
            if (state === 'collapsed') setState('half')
            else if (state === 'half') setState('full')
            return
        }
        if (velocity > 500) {
            // Fast swipe down
            if (state === 'full') setState('half')
            else if (state === 'half') setState('collapsed')
            return
        }

        // Slow drag - use offset
        if (offset < -50) {
            if (state === 'collapsed') setState('half')
            else if (state === 'half') setState('full')
        } else if (offset > 50) {
            if (state === 'full') setState('half')
            else if (state === 'half') setState('collapsed')
        }
    }

    const handleHeaderClick = () => {
        if (state === 'collapsed') setState('half')
        else if (state === 'half') setState('full')
        else setState('half')
    }

    const height = getHeightForState(state)

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-gray-200"
            initial={{ height: getHeightForState(defaultState) }}
            animate={{ height }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            style={{ maxHeight: '90vh' }}
        >
            {/* Drag Handle */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-14 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={handleHeaderClick}
            >
                <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
                <div className="flex items-center gap-2 px-4">
                    <span className="text-gray-900 font-bold text-sm">{title}</span>
                    {badge !== undefined && badge > 0 && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            <div
                className="pt-14 pb-20 px-4 overflow-y-auto h-full"
                style={{
                    pointerEvents: state === 'collapsed' ? 'none' : 'auto',
                    opacity: state === 'collapsed' ? 0.5 : 1
                }}
            >
                {children}
            </div>
        </motion.div>
    )
}
