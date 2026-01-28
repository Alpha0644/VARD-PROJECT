import { z } from 'zod'

export const createMissionSchema = z.object({
    title: z.string().min(5, 'Le titre doit faire au moins 5 caractères').max(100),
    description: z.string().optional(),
    location: z.string().min(5, 'Adresse requise'),
    latitude: z.number(),
    longitude: z.number(),
    requirements: z.array(z.string()).optional(),
    startTime: z.string().transform((str) => new Date(str)).refine((date) => date > new Date(), {
        message: 'La date de début doit être dans le futur'
    }),
    endTime: z.string().transform((str) => new Date(str)),
}).refine((data) => data.endTime > data.startTime, {
    message: 'La date de fin doit être après la date de début',
    path: ['endTime']
})

export const updateMissionStatusSchema = z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    latitude: z.number().optional(),
    longitude: z.number().optional()
})
