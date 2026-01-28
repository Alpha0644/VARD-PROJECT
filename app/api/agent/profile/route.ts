import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
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

        const bio = formData.get('bio') as string
        const operatingRadius = formData.get('operatingRadius') ? parseInt(formData.get('operatingRadius') as string) : null

        let specialties: string[] = []
        try {
            const specString = formData.get('specialties') as string
            if (specString) {
                specialties = JSON.parse(specString)
            }
        } catch (e) {
            console.error('Failed to parse specialties', e)
        }

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
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
