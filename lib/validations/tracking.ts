import { z } from 'zod'

export const trackingSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
    heading: z.number().optional().nullable(),
    speed: z.number().optional().nullable(),
    timestamp: z.number(),
})

export type TrackingPayload = z.infer<typeof trackingSchema>
