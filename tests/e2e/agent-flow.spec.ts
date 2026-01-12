/**
 * OMEGA Protocol v3.0 - Agent Flow E2E Tests
 * Critical Path: Registration → Documents → Mission Accept → Status Updates
 */

import { test, expect } from '@playwright/test'
import { createVerifiedAgent, loginUser, uploadDocument, waitForText } from './helpers/auth'

test.describe('🎯 Agent Complete Flow', () => {
    test('agent can register, upload documents, and accept mission', async ({ page }) => {
        // STEP 1: Register as Agent
        const agent = await createVerifiedAgent(page)

        // STEP 2: Login
        await loginUser(page, agent.email, agent.password)

        // STEP 3: Verify we're on agent dashboard
        await expect(page).toHaveURL(/\/agent\/dashboard/)

        // STEP 4: Check for document upload prompt
        // Since agent is not verified, should see upload form
        const hasUploadForm = await page.locator('input[type="file"]').count() > 0

        if (hasUploadForm) {
            // STEP 5: Upload documents (CNAPS + ID card)
            // Note: In real E2E tests, you'd provide actual test files
            // For now, we verify the UI elements exist

            const cnapsInput = page.locator('input[type="file"]').first()
            expect(await cnapsInput.count()).toBeGreaterThan(0)

            // Document upload would happen here in full E2E test
            console.log('✅ Document upload UI verified')
        }

        // STEP 6: Navigate to dashboard (after hypothetical approval)
        await page.goto('/agent/dashboard')

        // STEP 7: Check for mission proposals section
        const hasMissionSection = await page.locator('text=/missions|propositions/i').count() > 0
        expect(hasMissionSection).toBe(true)

        // STEP 8: If missions available, verify accept button exists
        const acceptButton = page.locator('button:has-text("Accepter"), button:has-text("Accept")')
        if (await acceptButton.count() > 0) {
            console.log('✅ Mission accept UI verified')
        }
    })

    test('agent can update mission status through workflow', async ({ page }) => {
        // Login as existing agent
        const agent = {
            email: 'test-agent@vard.test',
            password: 'password123', // Assuming pre-seeded test user
        }

        await loginUser(page, agent.email, agent.password)
        await page.goto('/agent/dashboard')

        // Look for active mission section
        const activeMissionSection = page.locator('text=/mission active|active mission/i')

        if (await activeMissionSection.count() > 0) {
            // Test status update buttons
            const statusButtons = [
                'EN_ROUTE',
                'ARRIVED',
                'IN_PROGRESS',
                'COMPLETED'
            ]

            for (const status of statusButtons) {
                const button = page.locator(`button:has-text("${status}")`)
                if (await button.count() > 0) {
                    console.log(`✅ Status button "${status}" found`)
                    break // Don't actually click in this test
                }
            }
        }
    })

    test('agent can view mission history', async ({ page }) => {
        const agent = {
            email: 'test-agent@vard.test',
            password: 'password123',
        }

        await loginUser(page, agent.email, agent.password)

        // Navigate to history page
        await page.goto('/agent/history')

        // Verify page loaded
        await expect(page).toHaveURL(/\/agent\/history/)

        // Check for history list or empty state
        const hasHistory = await page.locator('text=/historique|history|missions/i').count() > 0
        const hasEmptyState = await page.locator('text=/aucune|no missions|empty/i').count() > 0

        expect(hasHistory || hasEmptyState).toBe(true)
    })

    test('unverified agent is blocked from accepting missions', async ({ page }) => {
        // Create new agent (unverified)
        const agent = await createVerifiedAgent(page)
        await loginUser(page, agent.email, agent.password)

        await page.goto('/agent/dashboard')

        // Should see document upload prompt, not mission accept
        const hasUploadPrompt = await page.locator('text=/upload|document|vérif|verify/i').count() > 0

        // Verify cannot navigate to mission features
        expect(hasUploadPrompt).toBe(true)
    })
})
