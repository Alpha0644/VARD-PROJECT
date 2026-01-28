import { Skeleton } from '@/components/ui/skeletons'

export default function Loading() {
    return (
        <div className="relative w-full h-full min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <Skeleton className="h-4 w-32 bg-gray-800" />
            </div>

            {/* Bottom Sheet Skeleton Placeholder */}
            <div className="absolute inset-x-0 bottom-0 p-4 pb-24">
                <Skeleton className="h-40 w-full rounded-2xl bg-gray-800" />
            </div>
        </div>
    )
}
