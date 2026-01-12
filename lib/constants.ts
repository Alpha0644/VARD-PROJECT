/**
 * Application Constants
 * OMEGA Protocol: No magic numbers in code
 */

// Mission Defaults
export const MISSION_DEFAULTS = {
    DURATION_HOURS: 8,
    RADIUS_KM: 10,
    POLLING_INTERVAL_MS: 5000,
    MAX_NOTIFICATIONS_PER_MISSION: 50,
} as const

// Auth Constants
export const AUTH_CONSTANTS = {
    SESSION_MAX_AGE_DAYS: 30,
    BCRYPT_ROUNDS: 12,
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_TOKEN_EXPIRY_HOURS: 24,
} as const

// Rate Limiting
export const RATE_LIMITS = {
    LOGIN: {
        MAX_ATTEMPTS: 5,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    REGISTER: {
        MAX_ATTEMPTS: 3,
        WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
    },
    API_MISSIONS: {
        MAX_REQUESTS: 20,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
    API_UPLOAD: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
    API_ADMIN: {
        MAX_REQUESTS: 50,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
} as const

// File Upload
export const UPLOAD_CONSTRAINTS = {
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIMES: [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ] as const,
} as const

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const

// User Roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    AGENT: 'AGENT',
    COMPANY: 'COMPANY',
} as const

// Mission Status
export const MISSION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    EN_ROUTE: 'EN_ROUTE',
    ARRIVED: 'ARRIVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const

// Document Types
export const DOCUMENT_TYPES = {
    CNAPS: 'CNAPS',
    ID_CARD: 'ID_CARD',
    SIREN_FIRM: 'SIREN_FIRM',
    INSURANCE: 'INSURANCE',
} as const

// Document Status
export const DOCUMENT_STATUS = {
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
} as const
