'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin, Clock, Euro, ArrowUpDown } from 'lucide-react'

export interface MissionFilters {
    maxDistance: number | null      // km
    minDuration: number | null      // hours
    maxDuration: number | null      // hours
    minPrice: number | null         // €
    sortBy: 'distance' | 'price' | 'date'
}

interface MissionFiltersProps {
    filters: MissionFilters
    onFiltersChange: (filters: MissionFilters) => void
    missionCount: number
}

const DISTANCE_OPTIONS = [
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 },
    { label: 'Tous', value: null },
]

const DURATION_OPTIONS = [
    { label: '< 2h', min: null, max: 2 },
    { label: '2-4h', min: 2, max: 4 },
    { label: '4-8h', min: 4, max: 8 },
    { label: '> 8h', min: 8, max: null },
    { label: 'Tous', min: null, max: null },
]

const PRICE_OPTIONS = [
    { label: '> 50€', value: 50 },
    { label: '> 100€', value: 100 },
    { label: '> 200€', value: 200 },
    { label: 'Tous', value: null },
]

const SORT_OPTIONS = [
    { label: 'Distance', value: 'distance' as const, icon: MapPin },
    { label: 'Prix', value: 'price' as const, icon: Euro },
    { label: 'Date', value: 'date' as const, icon: Clock },
]

export function MissionFiltersButton({
    filters,
    onFiltersChange,
    missionCount
}: MissionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)

    const hasActiveFilters =
        filters.maxDistance !== null ||
        filters.minDuration !== null ||
        filters.minPrice !== null

    const resetFilters = () => {
        onFiltersChange({
            maxDistance: null,
            minDuration: null,
            maxDuration: null,
            minPrice: null,
            sortBy: 'distance'
        })
    }

    return (
        <>
            {/* Filter Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all ${hasActiveFilters
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
                {hasActiveFilters && (
                    <span className="w-5 h-5 bg-white text-blue-600 rounded-full text-xs font-bold flex items-center justify-center">
                        !
                    </span>
                )}
            </motion.button>

            {/* Filter Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Filtrer les missions</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Distance */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">Distance max</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DISTANCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => onFiltersChange({ ...filters, maxDistance: opt.value })}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.maxDistance === opt.value
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-4 h-4 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">Durée</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DURATION_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => onFiltersChange({
                                                    ...filters,
                                                    minDuration: opt.min,
                                                    maxDuration: opt.max
                                                })}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.minDuration === opt.min && filters.maxDuration === opt.max
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Euro className="w-4 h-4 text-green-600" />
                                        <h3 className="font-semibold text-gray-900">Rémunération min</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {PRICE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => onFiltersChange({ ...filters, minPrice: opt.value })}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.minPrice === opt.value
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ArrowUpDown className="w-4 h-4 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900">Trier par</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {SORT_OPTIONS.map(opt => {
                                            const Icon = opt.icon
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => onFiltersChange({ ...filters, sortBy: opt.value })}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.sortBy === opt.value
                                                            ? 'bg-orange-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {opt.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Réinitialiser
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Voir {missionCount} mission{missionCount > 1 ? 's' : ''}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

// Default filters
export const defaultFilters: MissionFilters = {
    maxDistance: null,
    minDuration: null,
    maxDuration: null,
    minPrice: null,
    sortBy: 'distance'
}
