export default function MentionsLegalesPage() {
    return (
        <article className="prose prose-slate lg:prose-lg mx-auto">
            <h1>Mentions Légales</h1>
            <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <h2>1. Éditeur du site</h2>
            <p>
                Le site VARD (ci-après "le Site") est édité par la société VARD SAS,
                société par actions simplifiée au capital de 10 000 euros.<br />
                <strong>Siège social :</strong> 10 Avenue des Champs-Élysées, 75008 Paris, France.<br />
                <strong>RCS :</strong> Paris B 123 456 789<br />
                <strong>Email :</strong> contact@vard.test<br />
                <strong>Directeur de la publication :</strong> M. le Président de VARD SAS.
            </p>

            <h2>2. Hébergement</h2>
            <p>
                Le Site est hébergé par Vercel Inc.<br />
                440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
                Site web : https://vercel.com
            </p>

            <h2>3. Propriété Intellectuelle</h2>
            <p>
                L'ensemble du contenu du Site (textes, images, base de données, algorithmes) est la propriété exclusive de VARD SAS ou de ses partenaires. Toute reproduction totale ou partielle sans autorisation est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
            </p>

            <h2>4. Responsabilité</h2>
            <p>
                VARD SAS s'efforce d'assurer l'exactitude des informations diffusées sur le Site mais ne saurait être tenue responsable des erreurs ou omissions. L'utilisation des services de mise en relation (Agents/Entreprises) se fait sous la responsabilité des utilisateurs.
            </p>
        </article>
    )
}
