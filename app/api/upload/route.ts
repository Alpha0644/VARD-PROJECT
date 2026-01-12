import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { checkApiRateLimit } from '@/lib/rate-limit'
import { UPLOAD_CONSTRAINTS } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const session = await auth()
    console.log('[API Upload Debug] Session:', session ? `User ${session.user?.email}` : 'NULL')
    console.log('[API Upload Debug] Headers:', Object.fromEntries(req.headers))

    if (!session) {
      console.log('[API Upload Debug] 401 returned - No session')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Rate limiting (5 uploads/min)
    const rateLimit = await checkApiRateLimit('upload', session.user.id)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes', message: 'Limite: 5 uploads par minute' },
        { status: 429 }
      )
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

    // Validate size
    if (file.size > UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES / 1024 / 1024}MB)` },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!UPLOAD_CONSTRAINTS.ALLOWED_MIMES.includes(file.type as any)) {
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
