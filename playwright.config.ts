import { defineConfig, devices } from '@playwright/test'

/**
 * OMEGA Protocol v3.0 - E2E Test Configuration
 * Critical Path Testing: Auth, Documents, Missions
 */

export default defineConfig({
    testDir: './tests/e2e',

    // Run tests in serial (one at a time) to avoid database conflicts
    fullyParallel: false,
    workers: 1,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Reporter
    reporter: process.env.CI ? 'github' : 'html',

    // Shared settings for all projects
    use: {
        // Base URL for tests
        baseURL: 'http://localhost:3000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',

        // Default Location (Paris) for Geolocation tests
        geolocation: { latitude: 48.8566, longitude: 2.3522 },
        permissions: ['geolocation'],
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Uncomment for cross-browser testing
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],

    // Run local dev server before starting tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
})
