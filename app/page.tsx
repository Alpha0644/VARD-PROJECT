export default function HomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🚀 OMEGA v3.1 - Uber for Security
                </h1>
                <p className="text-gray-600 mb-8">
                    Platform initialization successful
                </p>
                <div className="space-x-4">
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </a>
                    <a
                        href="/register"
                        className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                        Register
                    </a>
                </div>
            </div>
        </div>
    )
}
