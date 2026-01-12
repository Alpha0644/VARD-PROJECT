# Testing Standards & Templates

## Overview

This document provides standardized templates and best practices for writing tests in the VARD platform, following OMEGA Protocol requirements.

---

## Test Coverage Requirements

| Category | Coverage Target | Status |
|----------|----------------|--------|
| Critical Paths (auth, payment) | 100% | ✅ |
| Business Logic (missions) | 85% | 🟡 In Progress |
| UI Components | 70% | ⏳ Planned |
| Utils | 90% | ✅ |

---

## Test Structure

```
tests/
├── unit/           # Isolated function/module tests
│   ├── api/        # API route tests
│   ├── lib/        # Library function tests
│   └── auth/       # Auth schema tests
├── e2e/            # End-to-end user flows (Playwright)
├── utils/          # Test utilities & mocks
└── setup.ts        # Global test configuration
```

---

## 1. Unit Test Template

### File Naming
- `[feature].test.ts` for logic/utils
- `[route-name].test.ts` for API routes

### Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { functionToTest } from '@/path/to/function'

// Mock dependencies
vi.mock('@/lib/dependency', () => ({
  dependencyFunction: vi.fn(),
}))

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should do X when Y', async () => {
      // Arrange
      const input = { ... }
      vi.mocked(dependencyFunction).mockResolvedValue({ ... })

      // Act
      const result = await functionToTest(input)

      // Assert
      expect(result).toEqual(expectedOutput)
      expect(dependencyFunction).toHaveBeenCalledWith(expectedArgs)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when invalid input', async () => {
      const invalidInput = { ... }

      await expect(functionToTest(invalidInput)).rejects.toThrow('Expected error message')
    })
  })
})
```

---

## 2. API Route Test Template

### Example: POST /api/resource
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/resource/route'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db')
vi.mock('@/lib/auth')

describe('POST /api/resource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create resource on valid request', async () => {
    // Mock auth session
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', role: 'AGENT', isVerified: true },
    } as any)

    // Mock DB response
    vi.mocked(db.resource.create).mockResolvedValue({
      id: 'resource-123',
      ...mockData,
    } as any)

    const request = new Request('http://localhost:3000/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Resource' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.resource.id).toBe('resource-123')
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/resource', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should return 400 on validation error', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', role: 'AGENT', isVerified: true },
    } as any)

    const request = new Request('http://localhost:3000/api/resource', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // Invalid: empty name
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should enforce rate limiting', async () => {
    // Test rate limit logic (if applicable)
  })
})
```

---

## 3. E2E Test Template (Playwright)

### File Naming
- `[feature]-flow.spec.ts`

### Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Complete User Flow', () => {
  test('user can register, login, and complete action', async ({ page }) => {
    // 1. Navigate to registration
    await page.goto('/register')

    // 2. Fill registration form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePass123')
    await page.fill('[name="name"]', 'Test User')
    await page.selectOption('[name="role"]', 'AGENT')

    // 3. Submit
    await page.click('button[type="submit"]')

    // 4. Wait for redirect
    await page.waitForURL('/login')

    // 5. Login
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePass123')
    await page.click('button[type="submit"]')

    // 6. Verify dashboard loaded
    await page.waitForURL('/agent/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')

    // 7. Perform action
    await page.click('[data-testid="accept-mission"]')

    // 8. Verify result
    await expect(page.locator('.success-message')).toBeVisible()
  })

  test('handles error states correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Wrong password
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('.error-message')).toContainText('incorrect')
  })
})
```

---

## 4. Component Test Template (React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Component } from '@/components/feature/Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('calls callback on button click', () => {
    const mockCallback = vi.fn()
    
    render(<Component onAction={mockCallback} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('updates UI on state change', async () => {
    render(<Component />)
    
    const input = screen.getByLabelText('Input Label')
    fireEvent.change(input, { target: { value: 'New Value' } })
    
    expect(screen.getByDisplayValue('New Value')).toBeInTheDocument()
  })
})
```

---

## 5. Mock Utilities

### Using Typed Mocks

```typescript
import { createMockDb, createMockAuth } from '@/tests/utils/mocks'

const mockDb = createMockDb()
const mockAuth = createMockAuth()

// Use in tests
vi.mocked(db).mockImplementation(() => mockDb)
vi.mocked(auth).mockImplementation(() => mockAuth)
```

### Custom Mock Factory
```typescript
// tests/utils/factories.ts
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'AGENT',
    isVerified: true,
    ...overrides,
  }
}

export function createMockMission(overrides = {}) {
  return {
    id: 'mission-123',
    title: 'Test Mission',
    status: 'PENDING',
    ...overrides,
  }
}
```

---

## 6. Running Tests

### Commands
```bash
# Run all tests
npm run test

# Run specific file
npm run test auth.test.ts

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Watch mode (dev)
npm run test:watch
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test
      - run: npm run test:e2e
```

---

## 7. Best Practices

### DO ✅
- Write tests BEFORE code (TDD)
- Test behavior, not implementation
- Use descriptive test names (`it('should X when Y')`)
- Mock external dependencies
- Test happy path + 3 error scenarios minimum
- Keep tests isolated (no shared state)

### DON'T ❌
- Test implementation details
- Write flaky tests (timing-dependent)
- Skip edge cases
- Use real database in unit tests
- Leave commented test code

---

## 8. Debugging Tests

### VSCode Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### Useful Vitest APIs
```typescript
// Only run this test
it.only('focused test', () => { ... })

// Skip this test
it.skip('skipped test', () => { ... })

// Run test multiple times with different inputs
it.each([
  [input1, expected1],
  [input2, expected2],
])('handles %s correctly', (input, expected) => {
  expect(fn(input)).toBe(expected)
})
```

---

## 9. Coverage Reports

### Viewing Coverage
```bash
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds (`vitest.config.ts`)
```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
```

---

## 10. References

- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [OMEGA Protocol Section 7](/.cursor rules#L455)

---

*Last Updated: 2025-12-31 - Phase 2 Completion*
