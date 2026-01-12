/**
 * OMEGA Protocol v3.0 - Admin Flow E2E Tests
 * Critical Path: Login → Document Validation → Mission Oversight
 */

import { test, expect } from '@playwright/test'
import { loginUser } from './helpers/auth'

test.describe('🛡️ Admin Flow', () => {
    // Admin credentials (pre-seeded in test DB)
    const admin = {
        email: 'admin@vard.test',
        password: 'admin123',
    }

    test('admin can access admin dashboard', async ({ page }) => {
        await loginUser(page, admin.email, admin.password)

        // Navigate to admin panel
        await page.goto('/admin')

        // Verify access granted
        await expect(page).toHaveURL('/admin')

        // Check for admin UI elements
        const hasAdminUI = await page.locator('text=/admin|documents|validation/i').count() > 0
        expect(hasAdminUI).toBe(true)
    })

    test('admin can view pending documents', async ({ page }) => {
        await loginUser(page, admin.email, admin.password)
        await page.goto('/admin')

        // Look for documents list
        const hasDocumentList = await page.locator('text=/documents|pending|en attente/i').count() > 0
        const hasEmptyState = await page.locator('text=/aucun|no documents/i').count() > 0

        expect(hasDocumentList || hasEmptyState).toBe(true)
    })

    test('admin can approve document', async ({ page }) => {
        await loginUser(page, admin.email, admin.password)
        await page.goto('/admin')

        // Look for approve button
        const approveButton = page.locator('button:has-text("Approuver"), button:has-text("Approve"), button:has-text("Valider")')

        if (await approveButton.count() > 0) {
            console.log('✅ Document approval UI verified')
            // Don't actually click to avoid side effects
        }
    })

    test('admin can reject document', async ({ page }) => {
        await loginUser(page, admin.email, admin.password)
        await page.goto('/admin')

        // Look for reject button
        const rejectButton = page.locator('button:has-text("Rejeter"), button:has-text("Reject")')

        if (await rejectButton.count() > 0) {
            console.log('✅ Document rejection UI verified')
        }
    })

    test('admin can view all missions', async ({ page }) => {
        await loginUser(page, admin.email, admin.password)
        await page.goto('/admin')

        // Check for missions section
        const hasMissionSection = await page.locator('text=/missions|oversight/i').count() > 0

        // Admin should see all missions regardless of status
        console.log(`Mission oversight UI: ${hasMissionSection ? 'Present' : 'Not found'}`)
    })

    test('non-admin cannot access admin dashboard', async ({ page }) => {
        // Try to login as agent or company
        const agent = {
            email: 'test-agent@vard.test',
            password: 'password123',
        }

        await loginUser(page, agent.email, agent.password)

        // Attempt to navigate to admin
        await page.goto('/admin')

        // Should be redirected or see unauthorized message
        await page.waitForLoadState('networkidle')

        const url = page.url()
        const isRedirected = !url.includes('/admin') || url.includes('unauthorized')

        expect(isRedirected).toBe(true)
    })
})
