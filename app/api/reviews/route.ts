import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
    missionId: z.string(),
    targetId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
})

// POST - Create a review
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await req.json()
        const parsed = reviewSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { missionId, targetId, rating, comment } = parsed.data
        const authorId = session.user.id

        // 1. Check if mission exists and is completed
        const mission = await db.mission.findUnique({
            where: { id: missionId },
            include: { agent: true, company: true }
        })

        if (!mission) {
            return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
        }

        if (mission.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'La mission doit être terminée pour laisser un avis' }, { status: 400 })
        }

        // 2. Verify authorization (author must be part of the mission)
        const isAgent = mission.agent?.userId === authorId
        const isCompany = mission.company.userId === authorId

        if (!isAgent && !isCompany) {
            return NextResponse.json({ error: 'Vous ne faites pas partie de cette mission' }, { status: 403 })
        }

        // 3. Verify target (cannot rate yourself, must rate the other party)
        if (targetId === authorId) {
            return NextResponse.json({ error: 'Vous ne pouvez pas vous noter vous-même' }, { status: 400 })
        }

        const correctTargetId = isAgent ? mission.company.userId : mission.agent?.userId
        if (targetId !== correctTargetId) {
            return NextResponse.json({ error: 'Destinataire incorrect pour cet avis' }, { status: 400 })
        }

        // 4. Check if already reviewed
        const existingReview = await db.review.findFirst({
            where: {
                missionId,
                authorId
            }
        })

        if (existingReview) {
            return NextResponse.json({ error: 'Vous avez déjà donné votre avis pour cette mission' }, { status: 400 })
        }

        // 5. Create Review
        const review = await db.review.create({
            data: {
                rating,
                comment,
                missionId,
                authorId,
                targetId
            }
        })

        return NextResponse.json(review)

    } catch (error) {
        console.error('Create Review Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// GET - Get reviews for a user (average + list)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId requis' }, { status: 400 })
        }

        const reviews = await db.review.findMany({
            where: { targetId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true } // Minimal author info
                }
            },
            take: 20 // Limit to last 20 reviews
        })

        const count = await db.review.count({ where: { targetId: userId } })

        // Calculate average
        const aggregations = await db.review.aggregate({
            where: { targetId: userId },
            _avg: { rating: true }
        })

        const average = aggregations._avg.rating || 0

        return NextResponse.json({
            reviews,
            stats: {
                count,
                average: Number(average.toFixed(1))
            }
        })

    } catch (error) {
        console.error('Get Reviews Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
