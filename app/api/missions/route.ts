import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { findNearbyAgents } from '@/lib/redis-geo'

const createMissionSchema = z.object({
    title: z.string().min(5),
    description: z.string().optional(),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.string().transform((str) => new Date(str)),
    location: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    requirements: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()


        if (!session || session.user.role !== 'COMPANY') {

            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        if (!session.user.isVerified) {
            return NextResponse.json({ error: 'Compte non vérifié' }, { status: 403 })
        }

        const body = await req.json()
        const validated = createMissionSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validated.error.flatten() },
                { status: 400 }
            )
        }

        const { title, description, startTime, endTime, location, latitude, longitude } = validated.data

        // 1. Ensure Company Profile exists
        let company = await db.company.findUnique({
            where: { userId: session.user.id },
        })

        if (!company) {
            // Lazy create company profile if missing (MVP shortcut)
            company = await db.company.create({
                data: {
                    userId: session.user.id,
                    companyName: session.user.name || 'Agence Sans Nom',
                    siren: 'PENDING-' + Math.floor(Math.random() * 100000), // Temporary placeholder
                },
            })
        }

        // 2. Create Mission in DB
        const mission = await db.mission.create({
            data: {
                title,
                description,
                startTime,
                endTime,
                location,
                latitude,
                longitude,
                status: 'PENDING',
                companyId: company.id,
            },
        })

        // 3. Find Nearby Agents (Matching Engine)
        // Radius: 10km default
        const nearbyAgentIds = await findNearbyAgents(latitude, longitude, 10)

        // 4. Create Notifications
        if (nearbyAgentIds.length > 0) {
            // SQLite doesn't support skipDuplicates, so we create one by one
            for (const agentId of nearbyAgentIds) {
                try {
                    await db.missionNotification.create({
                        data: {
                            missionId: mission.id,
                            agentId: agentId,
                            status: 'SENT',
                        }
                    })
                } catch (e) {
                    // Skip if already exists (unique constraint)

                }
            }


        } else {

        }

        return NextResponse.json({ mission, notifiedCount: nearbyAgentIds.length })
    } catch (error) {
        console.error('Create Mission Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
