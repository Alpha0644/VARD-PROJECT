import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    plugins: [],
    test: {
        environment: 'node',
        globals: true,
        exclude: [
            'node_modules/**',
            'dist/**',
            '**/*.spec.ts', // Playwright E2E tests
            '**/*.e2e.ts',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
            ],
            // OMEGA Protocol Coverage Gates
            thresholds: {
                lines: 85,
                functions: 85,
                branches: 80,
                statements: 85,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            'next/server': path.resolve(__dirname, './node_modules/next/server.js'),
        },
    },
})
