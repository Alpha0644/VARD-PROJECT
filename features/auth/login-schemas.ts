import { z } from 'zod'

// ============================================
// AGENT LOGIN SCHEMA
// ============================================

// Regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_E164_REGEX = /^\+[1-9]\d{6,14}$/ // E.164 international format
const PHONE_FRENCH_REGEX = /^(?:0|\+33)[1-9](?:\d{8})$/ // French format

/**
 * Validates that the login identifier is either a valid email or phone number
 */
const loginIdentifierSchema = z.string()
    .min(1, 'Ce champ est requis')
    .refine(
        (value) => {
            // Clean the value (remove spaces for phone)
            const cleaned = value.replace(/\s/g, '')

            // Check if it's a valid email
            if (EMAIL_REGEX.test(cleaned)) return true

            // Check if it's a valid E.164 phone
            if (PHONE_E164_REGEX.test(cleaned)) return true

            // Check if it's a valid French phone (with or without +33)
            if (PHONE_FRENCH_REGEX.test(cleaned)) return true

            return false
        },
        { message: 'Format incorrect (email ou téléphone valide requis)' }
    )

export const agentLoginSchema = z.object({
    identifier: loginIdentifierSchema,
    password: z.string().min(1, 'Le mot de passe est requis'),
})

export type AgentLoginFormData = z.infer<typeof agentLoginSchema>

// ============================================
// ENTREPRISE LOGIN SCHEMA
// ============================================

/**
 * Luhn algorithm to validate SIREN/SIRET
 * Used by French tax administration
 */
export function validateLuhn(digits: string): boolean {
    if (!/^\d+$/.test(digits)) return false

    let sum = 0
    let isEven = false

    // Process from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10)

        if (isEven) {
            digit *= 2
            if (digit > 9) {
                digit -= 9
            }
        }

        sum += digit
        isEven = !isEven
    }

    return sum % 10 === 0
}

/**
 * Clean SIREN/SIRET by removing spaces and formatting
 */
export function cleanSirenSiret(value: string): string {
    return value.replace(/\D/g, '')
}

/**
 * Format SIREN (9 digits) with spaces: 123 456 789
 */
export function formatSiren(value: string): string {
    const digits = cleanSirenSiret(value).slice(0, 9)
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

/**
 * Format SIRET (14 digits) with spaces: 123 456 789 00012
 */
export function formatSiret(value: string): string {
    const digits = cleanSirenSiret(value).slice(0, 14)
    if (digits.length <= 9) {
        return formatSiren(digits)
    }
    const siren = digits.slice(0, 9)
    const nic = digits.slice(9)
    return `${formatSiren(siren)} ${nic}`
}

/**
 * Smart format for SIREN/SIRET based on length
 */
export function formatSirenSiret(value: string): string {
    const digits = cleanSirenSiret(value)
    if (digits.length <= 9) {
        return formatSiren(digits)
    }
    return formatSiret(digits)
}

/**
 * SIREN/SIRET validation schema
 */
const sirenSiretSchema = z.string()
    .min(1, 'L\'identifiant société est requis')
    .transform(cleanSirenSiret)
    .refine(
        (value) => value.length === 9 || value.length === 14,
        { message: 'Le SIREN doit avoir 9 chiffres ou le SIRET 14 chiffres' }
    )
    .refine(
        validateLuhn,
        { message: 'Numéro SIREN/SIRET invalide (vérification Luhn)' }
    )

/**
 * User identifier for B2B (email or phone)
 */
const userIdentifierSchema = z.string()
    .min(1, 'L\'identifiant utilisateur est requis')
    .refine(
        (value) => {
            const cleaned = value.replace(/\s/g, '')
            return EMAIL_REGEX.test(cleaned) ||
                PHONE_E164_REGEX.test(cleaned) ||
                PHONE_FRENCH_REGEX.test(cleaned)
        },
        { message: 'Format incorrect (email pro ou téléphone requis)' }
    )

/**
 * B2B password with stricter requirements
 */
const b2bPasswordSchema = z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')

export const entrepriseLoginSchema = z.object({
    sirenSiret: sirenSiretSchema,
    userIdentifier: userIdentifierSchema,
    password: b2bPasswordSchema,
    rememberSiret: z.boolean().optional().default(false),
})

export type EntrepriseLoginFormData = z.infer<typeof entrepriseLoginSchema>

// ============================================
// MOCK SIRET AUTOCOMPLETE DATA
// ============================================

export interface CompanySuggestion {
    siren: string
    siret: string
    name: string
    address: string
    city: string
    postalCode: string
}

/**
 * Mock companies database for SIRET autocomplete
 * In production, this would call the INSEE API
 */
const MOCK_COMPANIES: CompanySuggestion[] = [
    {
        siren: '123456782',
        siret: '12345678200010',
        name: 'VARD Technologies SAS',
        address: '15 Rue de la Sécurité',
        city: 'Paris',
        postalCode: '75008',
    },
    {
        siren: '123789455',
        siret: '12378945500011',
        name: 'SecuriPro France',
        address: '42 Avenue des Gardes',
        city: 'Lyon',
        postalCode: '69003',
    },
    {
        siren: '987654324',
        siret: '98765432400019',
        name: 'Protection Plus SARL',
        address: '8 Boulevard Marianne',
        city: 'Marseille',
        postalCode: '13001',
    },
    {
        siren: '456123785',
        siret: '45612378500010',
        name: 'GardienPro Services',
        address: '25 Rue de la République',
        city: 'Bordeaux',
        postalCode: '33000',
    },
    {
        siren: '789456126',
        siret: '78945612600018',
        name: 'Elite Sécurité SA',
        address: '100 Avenue Foch',
        city: 'Toulouse',
        postalCode: '31000',
    },
]

/**
 * Simulate API call to fetch company suggestions
 * @param query - First 3+ digits of SIREN/SIRET
 */
export async function fetchCompanySuggestions(query: string): Promise<CompanySuggestion[]> {
    const cleaned = cleanSirenSiret(query)

    if (cleaned.length < 3) {
        return []
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // Filter companies matching the query
    return MOCK_COMPANIES.filter(
        company =>
            company.siren.startsWith(cleaned) ||
            company.siret.startsWith(cleaned)
    )
}
