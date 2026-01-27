'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function verifyDocumentAction(documentId: string, userId: string) {
    try {
        // 1. Update Document Status
        await db.document.update({
            where: { id: documentId },
            data: { status: 'VERIFIED' }
        })

        // 2. Check if User can be verified (needs CNAPS + ID_CARD verified)
        const userDocs = await db.document.findMany({
            where: { userId },
            select: { type: true, status: true }
        })

        const hasVerifiedCNAPS = userDocs.some(d => d.type === 'CNAPS' && d.status === 'VERIFIED')
        const hasVerifiedID = userDocs.some(d => d.type === 'ID_CARD' && d.status === 'VERIFIED')

        if (hasVerifiedCNAPS && hasVerifiedID) {
            await db.user.update({
                where: { id: userId },
                data: { isVerified: true }
            })
        }

        revalidatePath('/admin/documents')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Verify doc error:', error)
        return { error: 'Failed to verify document' }
    }
}

export async function rejectDocumentAction(documentId: string) {
    try {
        await db.document.update({
            where: { id: documentId },
            data: { status: 'REJECTED' }
        })

        revalidatePath('/admin/documents')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to reject document' }
    }
}
