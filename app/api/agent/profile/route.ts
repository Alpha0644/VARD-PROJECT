import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentProfileSchema } from '@/lib/validations/profile'
import { logError } from '@/lib/logger'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'AGENT') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const formData = await req.formData()

        const rawData = {
            bio: formData.get('bio') as string | undefined,
            operatingRadius: formData.get('operatingRadius') ? parseInt(formData.get('operatingRadius') as string) : null,
            specialties: formData.get('specialties') ? JSON.parse(formData.get('specialties') as string) : [],
        }

        // Validate
        const validationResult = agentProfileSchema.safeParse(rawData)
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Données invalides',
                details: validationResult.error.format()
            }, { status: 400 })
        }

        const { bio, operatingRadius, specialties } = validationResult.data

        const imageFile = formData.get('image') as File | null
        let imageUrl: string | undefined = undefined

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer())
            const filename = `avatar-${session.user.id}-${randomUUID()}${path.extname(imageFile.name)}`

            // Ensure uploads directory exists
            const uploadDir = path.join(process.cwd(), 'public/uploads')
            try {
                await mkdir(uploadDir, { recursive: true })
            } catch (e) {
                // Ignore if exists
            }

            const filePath = path.join(uploadDir, filename)
            await writeFile(filePath, buffer)

            imageUrl = `/uploads/${filename}`
        }

        // Transaction to update User (image) and Agent (details)
        await db.$transaction(async (tx) => {
            // Update Agent Profile
            await tx.agent.update({
                where: { userId: session.user.id },
                data: {
                    bio,
                    operatingRadius,
                    specialties
                }
            })

            // Update User Avatar if changed
            if (imageUrl) {
                await tx.user.update({
                    where: { id: session.user.id },
                    data: {
                        image: imageUrl
                    }
                })
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        logError(error, { context: 'agent-profile-update' })
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
