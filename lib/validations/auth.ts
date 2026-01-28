import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
})

export const registerAgentSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
    cartePro: z.string().regex(/^[A-Z0-9-]{10,20}$/, 'Numéro CNAPS invalide'), // Basic regex, refine as needed
    carteProExp: z.string().transform((str) => new Date(str)), // Input as string from form, convert to Date
})

export const registerCompanySchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    companyName: z.string().min(2, 'Le nom de l\'entreprise doit faire au moins 2 caractères'),
    siren: z.string().regex(/^\d{9}$/, 'Le SIREN doit contenir exactement 9 chiffres'),
})
