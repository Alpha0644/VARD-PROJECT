import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { checkApiRateLimit } from '@/lib/rate-limit'
import { UPLOAD_CONSTRAINTS } from '@/lib/constants'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

// Image MIME types that should be processed by sharp
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png']

export async function POST(req: Request) {
  try {
    const session = await auth()


    if (!session) {
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
    if (!(UPLOAD_CONSTRAINTS.ALLOWED_MIMES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: 'Format invalide (PDF, JPG, PNG uniquement)' }, { status: 400 })
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer())

    // SECURITY: Strip EXIF metadata from images (removes GPS, camera info, etc.)
    if (IMAGE_MIMES.includes(file.type)) {
      const cleanedBuffer = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF orientation before stripping
        .toBuffer()
      buffer = cleanedBuffer as Buffer
      // sharp automatically strips EXIF when re-encoding
    }

    const filename = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    let finalUrl = ''

    // SUPABASE STORAGE (Production)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Storage provider selection

    if (supabaseUrl && supabaseKey) {
      // Supabase Storage (Production)
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('[Supabase Storage Error]', error)
        throw new Error('Erreur stockage Supabase')
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filename)

      finalUrl = publicUrl
    }
    // LOCAL FILESYSTEM (Development Fallback)
    else {
      console.log('[API Upload] Using Local Storage (Dev)')
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      // Ensure dir exists (not possible in Vercel/Lambda usually, but fine for local)

      const filePath = path.join(uploadDir, filename)

      // Try writing (will fail on Vercel without /tmp, but we want it to fail specific way here)
      // Actually, for local dev, let's keep it.
      await writeFile(filePath, buffer)
      finalUrl = `/uploads/${filename}`
    }

    // Save to DB
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        type,
        status: 'PENDING',
        url: finalUrl,
        name: file.name,
      },
    })

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur technique lors de l\'upload' }, { status: 500 })
  }
}
