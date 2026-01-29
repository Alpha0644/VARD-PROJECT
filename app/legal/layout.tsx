import { B2BHeader } from '@/components/company/b2b-header'

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // A simple layout for legal pages, could include a simple header
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto px-6 py-12 bg-white shadow-sm my-8 rounded-2xl">
                {children}
            </div>
        </div>
    )
}
