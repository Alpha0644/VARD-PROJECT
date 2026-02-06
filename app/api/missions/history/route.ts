import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { handleApiError, UnauthorizedError, ForbiddenError, BadRequestError } from '@/lib/api-error'

const searchParamsSchema = z.object({
    limit: z.coerce.number().min(1).max(50).default(10),
    offset: z.coerce.number().min(0).default(0),
    status: z.enum(['COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
})

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session) {
            throw new UnauthorizedError()
        }

        const { searchParams } = new URL(request.url)
        const validated = searchParamsSchema.safeParse(Object.fromEntries(searchParams))

        if (!validated.success) {
            return NextResponse.json(
                { error: 'Paramètres invalides', details: validated.error.flatten() },
                { status: 400 }
            )
        }

        const { limit, offset, status } = validated.data

        const userId = session.user.id

        // Build query based on role
        const whereClause: Prisma.MissionWhereInput = {
            // Only finished missions by default unless status specified
            status: status ? status : {
                in: ['COMPLETED', 'CANCELLED', 'NO_SHOW']
            }
        }

        if (session.user.role === 'AGENT') {
            // Agent sees missions assigned to them
            const agent = await db.agent.findUnique({
                where: { userId: session.user.id }
            })

            if (!agent) {
                // Not an error per se, just empty history for new agent
                return NextResponse.json({
                    data: [],
                    meta: { total: 0, limit, offset, hasMore: false }
                })
            }

            whereClause.agentId = agent.id
        } else if (session.user.role === 'COMPANY') {
            // Company sees missions they created
            const company = await db.company.findUnique({
                where: { userId: session.user.id }
            })

            if (!company) {
                return NextResponse.json({
                    data: [],
                    meta: { total: 0, limit, offset, hasMore: false }
                })
            }

            whereClause.companyId = company.id
        } else if (session.user.role === 'ADMIN') {
            // Admin sees everything (no additional filter)
        } else {
            throw new ForbiddenError('Rôle non reconnu')
        }

        // Execute query
        const [missions, total] = await Promise.all([
            db.mission.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
                orderBy: { startTime: 'desc' },
                include: {
                    company: {
                        select: { companyName: true, userId: true } // userId needed for rating target
                    },
                    agent: {
                        select: { cartePro: true, userId: true } // userId needed for rating target
                    },
                    reviews: {
                        where: { authorId: userId },
                        select: { id: true, rating: true }
                    }
                }
            }),
            db.mission.count({ where: whereClause })
        ])

        return NextResponse.json({
            data: missions,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        })

    } catch (error) {
        return handleApiError(error)
    }
}
