import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Type de document manquant' }, { status: 400 })
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5MB)' }, { status: 400 })
    }

    // Validate type
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format invalide (PDF, JPG, PNG uniquement)' }, { status: 400 })
    }

    // Save file locally (MVP) - In Production use S3/UploadThing
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const uploadDir = path.join(process.cwd(), 'public/uploads')

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Save to DB
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        type,
        status: 'PENDING',
        url: `/uploads/${filename}`,
        name: file.name,
      },
    })

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
