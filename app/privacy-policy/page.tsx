export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6">VARD - Privacy Policy</h1>

                <p className="text-sm text-gray-600 mb-8">Last Updated: December 31, 2025</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Data Controller</h2>
                    <p><strong>VARD Platform</strong></p>
                    <p>Email: privacy@vard.test</p>
                    <p>Address: [À remplir]</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>

                    <h3 className="text-xl font-medium mt-4 mb-2">2.1 Account Information</h3>
                    <ul className="list-disc ml-6 mb-4">
                        <li>Email address</li>
                        <li>Full name</li>
                        <li>Password (hashed)</li>
                        <li>Role (Agent, Company, Admin)</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">2.2 Professional Documents</h3>
                    <ul className="list-disc ml-6 mb-4">
                        <li><strong>Agents</strong>: CNAPS (Carte Professionnelle), ID Card/Passport</li>
                        <li><strong>Companies</strong>: SIREN/SIRET, Kbis</li>
                        <li><strong>Purpose</strong>: Legal compliance and security verification</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">2.3 Mission Data</h3>
                    <ul className="list-disc ml-6 mb-4">
                        <li>Geolocation (fuzzy, H3-based for privacy)</li>
                        <li>Mission status updates</li>
                        <li>Mission history and audit logs</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-4 mb-2">2.4 Technical Data</h3>
                    <ul className="list-disc ml-6 mb-4">
                        <li>IP address</li>
                        <li>Browser type and version</li>
                        <li>Session tokens</li>
                        <li>Rate limiting logs</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Legal Basis (RGPD Article 6)</h2>
                    <ul className="list-disc ml-6">
                        <li><strong>Consent</strong>: Email verification, document upload</li>
                        <li><strong>Contract</strong>: Mission matching and execution</li>
                        <li><strong>Legal Obligation</strong>: CNAPS verification (French security industry regulation)</li>
                        <li><strong>Legitimate Interest</strong>: Fraud prevention, platform integrity</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Your Rights (RGPD Articles 15-22)</h2>
                    <p className="mb-4">You have the right to:</p>

                    <h3 className="text-xl font-medium mt-4 mb-2">7.1 Access (Art. 15)</h3>
                    <p>Request a copy of all your data: <code className="bg-gray-100 px-2 py-1 rounded">/api/user/export-data</code></p>

                    <h3 className="text-xl font-medium mt-4 mb-2">7.3 Erasure (Art. 17)</h3>
                    <p>Delete your account: <code className="bg-gray-100 px-2 py-1 rounded">/api/user/delete-account</code></p>
                    <p className="text-sm text-red-600 mt-2">⚠️ Cannot delete if active missions in progress</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
                    <p className="mb-4">We use <strong>essential cookies only</strong>:</p>
                    <ul className="list-disc ml-6">
                        <li><code className="bg-gray-100 px-2 py-1 rounded">authjs.session-token</code>: Authentication (30 days)</li>
                        <li><code className="bg-gray-100 px-2 py-1 rounded">cookieConsent</code>: Your cookie preference (30 days)</li>
                    </ul>
                    <p className="mt-4"><strong>No tracking or analytics cookies</strong> currently used.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">13. Contact & Complaints</h2>
                    <p><strong>Email</strong>: privacy@vard.test</p>
                    <p><strong>DPO</strong>: dpo@vard.test</p>
                    <p className="mt-4"><strong>CNIL (France)</strong>:</p>
                    <p>https://www.cnil.fr/</p>
                    <p>3 Place de Fontenoy, 75007 Paris</p>
                </section>

                <hr className="my-8" />

                <p className="text-sm text-gray-600 italic text-center">
                    This policy complies with RGPD (EU 2016/679)
                </p>
            </div>
        </div>
    )
}
