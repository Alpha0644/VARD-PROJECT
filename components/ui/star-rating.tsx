'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    onRatingChange?: (rating: number) => void
    editable?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function StarRating({
    rating,
    maxRating = 5,
    onRatingChange,
    editable = false,
    size = 'md'
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null)

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    const currentSize = sizes[size]

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
                const starValue = index + 1
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!editable}
                        onClick={() => editable && onRatingChange?.(starValue)}
                        onMouseEnter={() => editable && setHoverRating(starValue)}
                        onMouseLeave={() => editable && setHoverRating(null)}
                        className={`transition-all ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} focus:outline-none`}
                    >
                        <Star
                            className={`${currentSize} ${isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-100 text-gray-300'
                                }`}
                        />
                    </button>
                )
            })}
        </div>
    )
}
