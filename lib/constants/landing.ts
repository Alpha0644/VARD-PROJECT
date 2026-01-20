// ============================================================================
// VARD Landing Page Constants
// OMEGA Compliant: No magic strings/numbers in components
// ============================================================================

/**
 * Brand information
 */
export const BRAND = {
    name: 'VARD',
    tagline: 'La sécurité, à la demande',
    description: 'VARD connecte agents de sécurité certifiés et entreprises en temps réel',
    logo: '🛡️', // TODO: Replace with SVG logo
} as const

/**
 * Navigation links
 */
export const NAV_LINKS = {
    main: [
        { href: '#agents', label: 'Agents' },
        { href: '#entreprises', label: 'Entreprises' },
        { href: '#comment-ca-marche', label: 'Comment ça marche' },
    ],
    auth: [
        { href: '/login', label: 'Connexion', variant: 'ghost' as const },
        { href: '/register', label: "S'inscrire", variant: 'primary' as const },
    ],
} as const

/**
 * Hero section content
 */
export const HERO_CONTENT = {
    agent: {
        title: 'Je suis un Agent',
        subtitle: 'Trouvez des missions de sécurité près de chez vous',
        cta: 'Voir les missions',
        ctaHref: '/login',
        placeholder: 'Votre ville',
        features: [
            'Missions géolocalisées',
            'Paiement garanti',
            'Liberté totale',
        ],
    },
    company: {
        title: 'Je suis une Entreprise',
        subtitle: 'Trouvez des agents qualifiés en urgence',
        cta: 'Poster une mission',
        ctaHref: '/login',
        placeholder: 'Lieu de la mission',
        features: [
            'Agents certifiés CNAPS',
            'Matching < 15 min',
            'Suivi GPS temps réel',
        ],
    },
} as const

/**
 * How it works steps
 */
export const HOW_IT_WORKS_STEPS = [
    {
        number: '01',
        icon: 'UserPlus',
        title: 'Inscrivez-vous',
        description: 'Créez votre compte en 2 minutes et uploadez vos documents (carte CNAPS ou SIREN)',
    },
    {
        number: '02',
        icon: 'Bell',
        title: 'Recevez des offres',
        description: 'Les agents reçoivent des missions géolocalisées, les entreprises des candidatures qualifiées',
    },
    {
        number: '03',
        icon: 'CheckCircle',
        title: 'Mission confirmée',
        description: 'Matching instantané, suivi en temps réel et paiement sécurisé en fin de mois',
    },
] as const

/**
 * Statistics for social proof
 * Note: Update these with real data as the platform grows
 */
export const STATS = [
    { value: '500+', label: 'Agents certifiés', suffix: '' },
    { value: '150+', label: 'Entreprises partenaires', suffix: '' },
    { value: '98%', label: 'Taux de satisfaction', suffix: '' },
    { value: '<15', label: 'Minutes de matching', suffix: 'min' },
] as const

/**
 * Benefits by user type
 */
export const BENEFITS = {
    agent: {
        title: 'Pourquoi rejoindre VARD en tant qu\'Agent ?',
        items: [
            {
                icon: 'MapPin',
                title: 'Missions près de chez vous',
                description: 'Recevez uniquement les offres dans votre rayon de déplacement',
            },
            {
                icon: 'Wallet',
                title: 'Paiement garanti',
                description: 'Récapitulatif mensuel et virement sécurisé en fin de mois',
            },
            {
                icon: 'Clock',
                title: 'Flexibilité totale',
                description: 'Acceptez les missions qui vous conviennent, quand vous voulez',
            },
            {
                icon: 'Shield',
                title: 'Zéro commission',
                description: 'Pendant la phase de lancement, aucune commission prélevée',
            },
        ],
    },
    company: {
        title: 'Pourquoi choisir VARD pour votre Entreprise ?',
        items: [
            {
                icon: 'BadgeCheck',
                title: 'Agents vérifiés CNAPS',
                description: 'Tous nos agents ont leur carte professionnelle validée',
            },
            {
                icon: 'Zap',
                title: 'Matching express',
                description: 'Trouvez un agent disponible en moins de 15 minutes',
            },
            {
                icon: 'Navigation',
                title: 'Suivi GPS temps réel',
                description: 'Suivez la position de vos agents pendant les missions',
            },
            {
                icon: 'FileText',
                title: 'Facturation simplifiée',
                description: 'Relevé d\'heures automatique et export comptable',
            },
        ],
    },
} as const

/**
 * Footer links organized by category
 */
export const FOOTER_LINKS = {
    agents: {
        title: 'Agents',
        links: [
            { href: '#comment-ca-marche', label: 'Comment ça marche' },
            { href: '/login', label: 'Connexion' },
            { href: '/register', label: 'Inscription' },
        ],
    },
    companies: {
        title: 'Entreprises',
        links: [
            { href: '/login', label: 'Poster une mission' },
            { href: '#tarifs', label: 'Tarifs' },
        ],
    },
    legal: {
        title: 'Légal',
        links: [
            { href: '/privacy-policy', label: 'Politique de confidentialité' },
            { href: '/privacy-policy#cookies', label: 'Cookies' },
            { href: '/mentions-legales', label: 'Mentions légales' },
        ],
    },
    contact: {
        title: 'Contact',
        links: [
            { href: 'mailto:contact@vard.fr', label: 'contact@vard.fr' },
            { href: 'https://linkedin.com/company/vard', label: 'LinkedIn' },
        ],
    },
} as const

/**
 * SEO Metadata
 */
export const SEO_METADATA = {
    title: 'VARD | Plateforme de sécurité privée à la demande',
    description: 'VARD connecte agents de sécurité certifiés CNAPS et entreprises en temps réel. Trouvez des missions ou des agents qualifiés en moins de 15 minutes.',
    keywords: 'sécurité privée, agent de sécurité, CNAPS, missions sécurité, gardiennage, surveillance',
    ogImage: '/og-image.png', // TODO: Create OG image
    twitterHandle: '@vard_security',
    siteUrl: 'https://vardproject.vercel.app',
} as const
