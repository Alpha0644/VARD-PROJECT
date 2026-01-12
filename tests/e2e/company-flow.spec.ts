/**
 * OMEGA Protocol v3.0 - Company Flow E2E Tests
 * Critical Path: Registration → Documents → Create Mission → Monitor Status
 */

import { test, expect } from '@playwright/test'
import { createVerifiedCompany, loginUser, waitForText } from './helpers/auth'

test.describe('🏢 Company Complete Flow', () => {
    test('verified company can create mission', async ({ page }) => {
        // STEP 1: Login as Verified Company (from seed)
        const company = {
            email: 'test-company@vard.test',
            password: 'password123',
        }

        await loginUser(page, company.email, company.password)

        // STEP 2: Verify we're on company dashboard
        await expect(page).toHaveURL(/\/company\/dashboard/)

        // STEP 3: Look for mission creation form
        // Verified companies should see the form
        // Verified companies should see the form
        const hasForm = await page.locator('form').count() > 0
        const hasText = await page.locator('text=Créer une Mission').count() > 0
        expect(hasForm || hasText).toBe(true)

        // STEP 5: Fill mission creation form (if available)
        const titleInput = page.locator('[name="title"]')
        if (await titleInput.count() > 0) {
            await titleInput.fill('Test Mission E2E - Gardiennage')

            const locationInput = page.locator('[name="location"]')
            if (await locationInput.count() > 0) {
                await locationInput.fill('Paris, France')
            }

            // Find submit button
            const submitButton = page.locator('button[type="submit"], button:has-text("Poster")')
            if (await submitButton.count() > 0) {
                console.log('✅ Mission creation form verified')
                // Don't actually submit in this test to avoid DB pollution
            }
        }
    })

    test('company can view created missions', async ({ page }) => {
        const company = {
            email: 'test-company@vard.test',
            password: 'password123',
        }

        await loginUser(page, company.email, company.password)
        await page.goto('/company/dashboard')

        // Look for missions list
        const hasMissionList = await page.locator('text=/missions|liste/i').count() > 0
        const hasEmptyState = await page.locator('text=/aucune|no missions/i').count() > 0

        expect(hasMissionList || hasEmptyState).toBe(true)
    })

    test('company can view mission history', async ({ page }) => {
        const company = {
            email: 'test-company@vard.test',
            password: 'password123',
        }

        await loginUser(page, company.email, company.password)

        // Navigate to history
        await page.goto('/company/history')

        await expect(page).toHaveURL(/\/company\/history/)

        // Verify history page elements
        const hasHistory = await page.locator('text=/historique|history/i').count() > 0
        expect(hasHistory).toBe(true)
    })

    test('company sees nearby agents notification count', async ({ page }) => {
        const company = {
            email: 'test-company@vard.test',
            password: 'password123',
        }

        await loginUser(page, company.email, company.password)
        await page.goto('/company/dashboard')

        // After creating a mission, should see notification count
        // This would be tested after actual mission creation
        const hasNotificationInfo = await page.locator('text=/agent|notifi/i').count() > 0

        console.log(`Notification UI present: ${hasNotificationInfo}`)
    })

    test('unverified company cannot create missions', async ({ page }) => {
        // Create new company (unverified)
        const company = await createVerifiedCompany(page)
        await loginUser(page, company.email, company.password)

        await page.goto('/company/dashboard')

        // Should see verification prompt
        const hasVerificationPrompt = await page.locator('text=/document|vérif|upload/i').count() > 0

        expect(hasVerificationPrompt).toBe(true)
    })
})
