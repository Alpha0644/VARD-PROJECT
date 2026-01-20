import Image from 'next/image'

export function DownloadAppSection() {
    return (
        <section className="bg-black text-white py-24 overflow-hidden relative">
            <div className="section-container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">

                {/* Text Content */}
                <div className="w-full md:w-1/2 mb-12 md:mb-0 z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                        La sécurité <br />
                        dans votre poche.
                    </h2>

                    <div className="flex flex-wrap items-center gap-6">
                        {/* App Store Badge - Inline SVG */}
                        <button className="hover:opacity-80 transition-opacity">
                            <svg width="150" height="50" viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="150" height="44" rx="8" fill="white" />
                                <text x="75" y="27" fontSize="16" fontWeight="bold" fill="black" textAnchor="middle">App Store</text>
                            </svg>
                        </button>

                        {/* Google Play Badge - Inline SVG */}
                        <button className="hover:opacity-80 transition-opacity">
                            <svg width="150" height="50" viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="150" height="44" rx="8" fill="white" />
                                <text x="75" y="27" fontSize="16" fontWeight="bold" fill="black" textAnchor="middle">Google Play</text>
                            </svg>
                        </button>
                    </div>

                    {/* QR Code */}
                    <div className="mt-12 flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg w-24 h-24">
                            <Image
                                src="/qr_code_mockup_1768929203965.png"
                                alt="Scan to download"
                                width={100}
                                height={100}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-gray-400 text-sm max-w-[120px]">
                            Scannez pour télécharger l'application
                        </span>
                    </div>
                </div>

                {/* Mobile Mockups - Absolute/Overflowing */}
                <div className="w-full md:w-1/2 relative h-[500px] md:h-auto flex items-center justify-center">
                    <div className="md:absolute md:top-[-100px] md:right-0 w-[120%] h-[600px] md:w-[800px] md:h-[800px]">
                        <Image
                            src="/vard_mobile_app_mockups_1768929176426.png"
                            alt="VARD Mobile App Screens"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}
