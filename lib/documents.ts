import { db } from '@/lib/db'

export enum DocumentType {
  CNAPS = 'CNAPS',
  ID_CARD = 'ID_CARD',
  SIREN_FIRM = 'SIREN_FIRM',
  INSURANCE = 'INSURANCE',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export async function getUserDocuments(userId: string) {
  return await db.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function checkUserVerificationStatus(userId: string, role: string) {
  const documents = await getUserDocuments(userId)

  if (role === 'AGENT') {
    const hasCnaps = documents.some(
      (d) => d.type === DocumentType.CNAPS && d.status === DocumentStatus.VERIFIED
    )
    const hasId = documents.some(
      (d) => d.type === DocumentType.ID_CARD && d.status === DocumentStatus.VERIFIED
    )
    return hasCnaps && hasId
  }

  if (role === 'COMPANY') {
    const hasSiren = documents.some(
      (d) => d.type === DocumentType.SIREN_FIRM && d.status === DocumentStatus.VERIFIED
    )
    return hasSiren
  }

  return false
}
