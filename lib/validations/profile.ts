import { z } from 'zod'

export const agentProfileSchema = z.object({
    bio: z.string().max(500, 'La bio ne doit pas dépasser 500 caractères').optional().or(z.literal('')),
    operatingRadius: z.number().min(5).max(200).optional().nullable(),
    specialties: z.array(z.string()).max(10, 'Maximum 10 spécialités'),
    image: z.any().optional(), // File validation is handled separately often, or use refinement if server-side FormData
})

export const companyProfileSchema = z.object({
    companyName: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
    address: z.string().optional().or(z.literal('')),
    description: z.string().max(1000, 'La description ne doit pas dépasser 1000 caractères').optional().or(z.literal('')),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    logo: z.any().optional(),
})
