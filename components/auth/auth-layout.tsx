'use client'

import Link from 'next/link'

interface AuthLayoutProps {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div
                className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
                style={{ backgroundImage: `url('/auth_city_night_background.png')` }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Quote at Bottom */}
                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <p className="text-white text-3xl font-light leading-relaxed">
                        La sécurité, réinventée.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col">
                {/* Header with Logo */}
                <div className="p-6 lg:p-8">
                    <Link href="/" className="text-black font-bold text-xl tracking-tight">
                        VARD
                    </Link>
                </div>

                {/* Form Container - Centered */}
                <div className="flex-1 flex items-center justify-center px-6 pb-12">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
