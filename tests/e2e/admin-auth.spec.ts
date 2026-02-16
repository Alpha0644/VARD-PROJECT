import { test, expect } from '@playwright/test'

test.describe('🔐 Admin Authentication', () => {
    test('can access admin login page', async ({ page }) => {
        await page.goto('/admin/login')
        await expect(page.locator('h1')).toHaveText('Administration')
    })

    test('valid admin login redirects to dashboard', async ({ page }) => {
        await page.goto('/admin/login')

        await page.fill('input[type="email"]', 'admin@vard.test')
        await page.fill('input[type="password"]', 'admin123')

        await page.click('button[type="submit"]')

        // Wait for redirect to admin dashboard
        await page.waitForURL('/admin')
        await expect(page).toHaveURL('/admin')
    })

    test('invalid credentials show error', async ({ page }) => {
        await page.goto('/admin/login')

        await page.fill('input[type="email"]', 'admin@vard.test')
        await page.fill('input[type="password"]', 'wrongpassword')

        await page.click('button[type="submit"]')

        // Check for error message
        await expect(page.locator('text=/accès refusé|vérifiez/i')).toBeVisible()
    })

    test('protected admin route redirects to login', async ({ page }) => {
        // Clear cookies to ensure logged out
        await page.context().clearCookies()

        await page.goto('/admin')

        // Should redirect to login (generic or admin specific depending on implementation)
        // With current middleware it might go to generic login with callback
        await expect(page).toHaveURL(/login/)
    })
})
