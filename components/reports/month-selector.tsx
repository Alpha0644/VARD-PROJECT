'use client'

import { format, subMonths, addMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface MonthSelectorProps {
    currentDate: Date
    onChange: (date: Date) => void
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
    const handlePrev = () => onChange(subMonths(currentDate, 1))
    const handleNext = () => onChange(addMonths(currentDate, 1))

    return (
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <button
                onClick={handlePrev}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-[140px] justify-center font-medium text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </span>
            </div>

            <button
                onClick={handleNext}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                disabled={addMonths(currentDate, 1) > new Date()}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
