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

/**
 * 🔴 CRITICAL: Check if agent's documents are valid (not expired)
 * Returns detailed status for UI display
 */
export interface DocumentValidityResult {
  isValid: boolean
  isExpired: boolean
  isExpiringSoon: boolean // Within 30 days
  expiringDocument?: {
    type: string
    expiresAt: Date
    daysRemaining: number
  }
  message?: string
}

export async function checkAgentDocumentsValidity(userId: string): Promise<DocumentValidityResult> {
  const documents = await db.document.findMany({
    where: {
      userId,
      type: DocumentType.CNAPS,
      status: DocumentStatus.VERIFIED,
    },
    orderBy: { expiresAt: 'desc' },
  })

  if (documents.length === 0) {
    return {
      isValid: false,
      isExpired: false,
      isExpiringSoon: false,
      message: 'Aucune carte professionnelle valide trouvée.',
    }
  }

  const cnapsDoc = documents[0]

  // If no expiration date set, consider it valid
  if (!cnapsDoc.expiresAt) {
    return {
      isValid: true,
      isExpired: false,
      isExpiringSoon: false,
    }
  }

  const now = new Date()
  const expiresAt = new Date(cnapsDoc.expiresAt)
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Document is expired
  if (expiresAt < now) {
    return {
      isValid: false,
      isExpired: true,
      isExpiringSoon: false,
      expiringDocument: {
        type: cnapsDoc.type,
        expiresAt,
        daysRemaining: 0,
      },
      message: `Votre carte professionnelle a expiré le ${expiresAt.toLocaleDateString('fr-FR')}. Veuillez uploader un nouveau document pour continuer à accepter des missions.`,
    }
  }

  // Document expires within 30 days - warning
  if (daysRemaining <= 30) {
    return {
      isValid: true, // Still valid but warn
      isExpired: false,
      isExpiringSoon: true,
      expiringDocument: {
        type: cnapsDoc.type,
        expiresAt,
        daysRemaining,
      },
      message: `Attention : Votre carte professionnelle expire dans ${daysRemaining} jour(s) (${expiresAt.toLocaleDateString('fr-FR')}).`,
    }
  }

  return {
    isValid: true,
    isExpired: false,
    isExpiringSoon: false,
  }
}

export async function checkUserVerificationStatus(userId: string, role: string) {
  // ADMIN users don't need document verification
  if (role === 'ADMIN') {
    return true
  }

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

/**
 * Enhanced verification that includes expiration check
 */
export async function checkAgentCanOperate(userId: string): Promise<{
  canOperate: boolean
  reason?: string
  warning?: string
}> {
  // First check if documents are verified
  const isVerified = await checkUserVerificationStatus(userId, 'AGENT')
  if (!isVerified) {
    return {
      canOperate: false,
      reason: 'Vos documents n\'ont pas encore été validés.',
    }
  }

  // Then check expiration
  const validity = await checkAgentDocumentsValidity(userId)

  if (validity.isExpired) {
    return {
      canOperate: false,
      reason: validity.message,
    }
  }

  if (validity.isExpiringSoon) {
    return {
      canOperate: true,
      warning: validity.message,
    }
  }

  return {
    canOperate: true,
  }
}

