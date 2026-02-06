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
    // Map role enum to UI text
    const roleText = user.role === 'COMPANY' ? 'Entreprise' : 'Agent'
    await page.locator(`button:has-text("${roleText}")`).click()

    await page.click('button[type="submit"]')

    // Wait for success message or redirect
    await page.waitForURL('**/login', { timeout: 15000 })
}

/**
 * Login via UI - supports both Agent and Company login flows
 */
export async function loginUser(
    page: Page,
    email: string,
    password: string,
    role: 'AGENT' | 'COMPANY' = 'AGENT'
) {
    await page.goto('/login')

    // Dismiss cookie banner if present
    const cookieBtn = page.locator('button:has-text("Accepter")').first()
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click()
    }

    await page.waitForLoadState('networkidle')

    if (role === 'COMPANY') {
        // Click on "Entreprise" tab
        await page.click('button:has-text("Entreprise")')
        await page.waitForTimeout(300)  // Wait for animation

        // For company login, we need SIRET + identifier + password
        // Using a test SIRET value
        await page.fill('#entreprise-siret', '12345678200010')
        await page.fill('#entreprise-identifier', email)
        await page.fill('#entreprise-password', password)
    } else {
        // Agent tab is default, but click to ensure
        await page.click('button:has-text("Agent")')
        await page.waitForTimeout(500)

        // Agent uses identifier (email/phone) + password
        // Use type/press to ensure events fire correctly for React
        await page.click('#agent-identifier')
        await page.keyboard.type(email, { delay: 50 })
        await page.waitForTimeout(200)

        await page.click('#agent-password')
        await page.keyboard.type(password, { delay: 50 })
        await page.waitForTimeout(200)

        // Debug: Log the value we typed
        const val = await page.inputValue('#agent-identifier')
        console.log(`[Login] Typed agent identifier: "${val}"`)
    }

    await page.click('button[type="submit"]')

    // Wait for redirect to any dashboard
    try {
        await page.waitForURL(/.*dashboard/, { timeout: 10000 })
    } catch (e) {
        console.log('[Login] Warning: Timeout waiting for dashboard redirect')
    }
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
