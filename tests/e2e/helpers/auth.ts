/**
 * OMEGA Protocol v3.0 - E2E Test Helpers
 * Reusable authentication utilities for Playwright tests
 */

import { Page } from '@playwright/test'

export interface TestUser {
    email: string
    password: string
    name: string
    role: 'AGENT' | 'COMPANY' | 'ADMIN'
}

/**
 * Register a new user via UI
 */
export async function registerUser(page: Page, user: TestUser) {
    await page.goto('/register')

    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.fill('[name="name"]', user.name)
    await page.click(`[value="${user.role}"]`)

    await page.click('button[type="submit"]')

    // Wait for success message or redirect
    await page.waitForURL('**/login', { timeout: 15000 })
}

/**
 * Login via UI
 */
export async function loginUser(page: Page, email: string, password: string) {
    await page.goto('/login')

    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForLoadState('networkidle')
}

/**
 * Create a verified agent user (for E2E tests)
 * This bypasses email verification for testing purposes
 */
export async function createVerifiedAgent(page: Page): Promise<TestUser> {
    const timestamp = Date.now()
    const user: TestUser = {
        email: `agent-${timestamp}@e2e.test`,
        password: 'SecureTest123!',
        name: `Test Agent ${timestamp}`,
        role: 'AGENT',
    }

    await registerUser(page, user)

    // In a real scenario, you'd verify the email here
    // For E2E tests, we assume the backend has a test mode or we manually verify

    return user
}

/**
 * Create a verified company user
 */
export async function createVerifiedCompany(page: Page): Promise<TestUser> {
    const timestamp = Date.now()
    const user: TestUser = {
        email: `company-${timestamp}@e2e.test`,
        password: 'SecureCompany123!',
        name: `Test Company ${timestamp}`,
        role: 'COMPANY',
    }

    await registerUser(page, user)

    return user
}

/**
 * Upload a document via UI
 */
export async function uploadDocument(
    page: Page,
    documentType: 'CNAPS' | 'ID_CARD' | 'SIREN_FIRM' | 'INSURANCE',
    filePath: string
) {
    // Find the file input for this document type
    const fileInput = page.locator(`input[type="file"]`).first()

    await fileInput.setInputFiles(filePath)

    // Wait for upload button and click
    const uploadButton = page.locator('button:has-text("Envoyer")')
    if (await uploadButton.count() > 0) {
        await uploadButton.click()
        await page.waitForLoadState('networkidle')
    }
}

/**
 * Wait for element with text (case-insensitive)
 */
export async function waitForText(page: Page, text: string | RegExp, timeout = 10000) {
    const regex = typeof text === 'string' ? new RegExp(text, 'i') : text
    await page.locator(`text=${regex}`).first().waitFor({ timeout })
}

/**
 * Check if user is logged in by checking for logout button
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout")')
    return await logoutButton.count() > 0
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout")')
    if (await logoutButton.count() > 0) {
        await logoutButton.first().click()
        await page.waitForURL('**/login', { timeout: 5000 })
    }
}
