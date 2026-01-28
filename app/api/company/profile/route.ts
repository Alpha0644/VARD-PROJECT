import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { companyProfileSchema } from '@/lib/validations/profile'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function PATCH(req: Request) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'COMPANY') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const formData = await req.formData()

        const rawData = {
            companyName: formData.get('companyName') as string,
            address: formData.get('address') as string,
            description: formData.get('description') as string,
            website: formData.get('website') as string,
        }

        const validationResult = companyProfileSchema.safeParse(rawData)
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Données invalides',
                details: validationResult.error.format()
            }, { status: 400 })
        }

        const { companyName, address, description, website } = validationResult.data

        const logoFile = formData.get('logo') as File | null
        let logoUrl: string | undefined = undefined

        // Handle Logo Upload
        if (logoFile && logoFile.size > 0) {
            const buffer = Buffer.from(await logoFile.arrayBuffer())
            const filename = `company-logo-${session.user.id}-${randomUUID()}${path.extname(logoFile.name)}`

            // Ensure uploads directory exists
            const uploadDir = path.join(process.cwd(), 'public/uploads')
            try {
                await mkdir(uploadDir, { recursive: true })
            } catch (e) {
                // Ignore if exists
            }

            const filePath = path.join(uploadDir, filename)
            await writeFile(filePath, buffer)

            logoUrl = `/uploads/${filename}`
        }

        // Update Company Profile
        await db.company.update({
            where: { userId: session.user.id },
            data: {
                companyName,
                address,
                description,
                website,
                ...(logoUrl && { logoUrl }) // Only update if new logo uploaded
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Company profile update error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
