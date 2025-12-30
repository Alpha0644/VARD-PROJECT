import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    plugins: [],
    test: {
        environment: 'node',
        globals: true,
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
            lines: 85,
            functions: 85,
            branches: 80,
            statements: 85,
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})
