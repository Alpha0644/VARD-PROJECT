export default function PrivacyPolicyPage() {
    return (
        <article className="prose prose-slate lg:prose-lg mx-auto">
            <h1>Politique de Confidentialité</h1>
            <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <p>
                La protection de vos données personnelles est au cœur de nos engagements.
                Cette politique détaille comment VARD collecte, utilise et protège vos informations.
            </p>

            <h2>1. Données collectées</h2>
            <ul>
                <li><strong>Identité :</strong> Nom, Prénom, Email, Téléphone.</li>
                <li><strong>Professionnel :</strong> Carte Professionnelle (CNAPS), Kbis, CV.</li>
                <li><strong>Localisation :</strong> Géolocalisation en temps réel (uniquement durant les missions actives).</li>
                <li><strong>Technique :</strong> Adresse IP, logs de connexion (sécurité).</li>
            </ul>

            <h2>2. Finalités du traitement</h2>
            <p>Nous traitons vos données pour :</p>
            <ul>
                <li>Assurer la mise en relation Agents / Entreprises.</li>
                <li>Vérifier la conformité légale (validité CNAPS, Kbis).</li>
                <li>Sécuriser la plateforme et prévenir la fraude.</li>
                <li>Générer la facturation et les rapports d'activité.</li>
            </ul>

            <h2>3. Géolocalisation</h2>
            <p>
                La géolocalisation des Agents n'est activée que lorsque le statut de la mission est "EN_ROUTE", "ARRIVED" ou "IN_PROGRESS".
                Elle est désactivée automatiquement à la fin de la mission.
                Les données de position précise sont conservées 30 jours pour audit puis anonymisées/supprimées.
            </p>

            <h2>4. Vos Droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
                <li>Droit d'accès et de rectification.</li>
                <li>Droit à l'effacement ("Droit à l'oubli").</li>
                <li>Droit à la limitation du traitement.</li>
            </ul>
            <p>Pour exercer ces droits, contactez notre DPO à : dpo@vard.test</p>

            <h2>5. Sécurité</h2>
            <p>
                Toutes les données sont chiffrées en transit (TLS) et au repos.
                L'accès est strictement limité au personnel autorisé.
            </p>
        </article>
    )
}
