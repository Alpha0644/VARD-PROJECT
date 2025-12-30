# TESTING STRATEGY v2.0

## 🎯 TESTING PHILOSOPHY

```
"If it's not tested, it's broken."
"If it's tested badly, it's still broken."
```

**Goals:**
- 🟢 Critical paths (auth, payments): **100% coverage**
- 🟡 Business logic: **85% coverage**
- 🔵 UI components: **70% coverage**
- ⚪ Utilities: **90% coverage**

**Testing Pyramid:**
```
        /\      E2E (10%)         <- Slow, expensive, high value
       /  \     Integration (30%)  <- Medium speed, medium cost
      /    \    Unit (60%)         <- Fast, cheap, foundation
     /______\
```

---

## 1. UNIT TESTS (Vitest + Testing Library)

### What to Test
- ✅ Pure functions (utils, helpers)
- ✅ Custom hooks
- ✅ Business logic (validation, calculations)
- ✅ Data transformers

### Template: Testing a Utility Function

```typescript
// /lib/utils/currency.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100) // Amount in cents
}

// /tests/lib/utils/currency.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234, 'USD')).toBe('$12.34')
  })

  it('formats EUR correctly', () => {
    expect(formatCurrency(5000, 'EUR')).toBe('€50.00')
  })

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$5.00')
  })

  it('throws on invalid currency', () => {
    expect(() => formatCurrency(100, 'INVALID')).toThrow()
  })
})
```

### Template: Testing a React Hook

```typescript
// /hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// /tests/hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'
import { vi } from 'vitest'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still old value

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated') // Now updated
  })
})
```

### Template: Testing a React Component

```typescript
// /components/ui/Button.tsx
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }))}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// /tests/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import { vi } from 'vitest'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('is accessible', () => {
    render(<Button>Accessible</Button>)
    const button = screen.getByRole('button', { name: /accessible/i })
    expect(button).toBeInTheDocument()
  })
})
```

---

## 2. INTEGRATION TESTS (API Routes & Database)

### What to Test
- ✅ API endpoints (complete request/response cycle)
- ✅ Database operations
- ✅ Authentication flows
- ✅ Business logic involving multiple layers

### Template: Testing an API Route

```typescript
// /app/api/users/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    take: 20,
  })

  return NextResponse.json({ users })
}

// /tests/api/users/route.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/users/route'
import { db } from '@/lib/db'

describe('GET /api/users', () => {
  beforeEach(async () => {
    // Seed test database
    await db.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    })
  })

  afterEach(async () => {
    // Clean up
    await db.user.deleteMany()
  })

  it('returns 401 if not authenticated', async () => {
    const req = new Request('http://localhost/api/users')
    const res = await GET(req)
    
    expect(res.status).toBe(401)
  })

  it('returns users if authenticated', async () => {
    // Mock authenticated session
    vi.mock('@/lib/auth', () => ({
      getServerSession: () => ({ user: { id: '1', email: 'test@example.com' } }),
    }))

    const req = new Request('http://localhost/api/users')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.users).toHaveLength(1)
    expect(data.users[0]).toHaveProperty('email', 'test@example.com')
  })
})
```

### Template: Testing Auth Flow

```typescript
// /tests/api/auth/login.test.ts
describe('POST /api/auth/login', () => {
  it('returns JWT on valid credentials', async () => {
    // Create test user
    await db.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('ValidPassword123!', 12),
      },
    })

    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPassword123!',
      }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('token')
  })

  it('returns 401 on wrong password', async () => {
    await db.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('correct', 12),
      },
    })

    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
    })

    expect(res.status).toBe(401)
  })

  it('rate limits after 5 failed attempts', async () => {
    await db.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('correct', 12),
      },
    })

    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong',
        }),
      })
    }

    // 6th should be blocked
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
    })

    expect(res.status).toBe(429) // Too Many Requests
  })
})
```

---

## 3. E2E TESTS (Playwright)

### What to Test
- ✅ Critical user journeys (signup → purchase → confirmation)
- ✅ Complex interactions across multiple pages
- ✅ Real browser behavior (forms, navigation, animations)

### Template: Testing Checkout Flow

```typescript
// /tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'ValidPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('complete purchase flow', async ({ page }) => {
    // 1. Browse product
    await page.goto('/products')
    await page.click('[data-testid="product-card"]:first-child')

    // 2. Add to cart
    await page.click('[data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // 3. Go to checkout
    await page.goto('/checkout')

    // 4. Fill payment (Stripe test mode)
    await page.fill('[name="cardNumber"]', '4242 4242 4242 4242')
    await page.fill('[name="cardExpiry"]', '12/25')
    await page.fill('[name="cardCvc"]', '123')

    // 5. Submit payment
    await page.click('[data-testid="pay-button"]')

    // 6. Verify success
    await page.waitForURL('/order/success')
    await expect(page.locator('h1')).toContainText('Payment Successful')

    // 7. Check database (optional)
    // const orders = await db.order.findMany({ where: { userId: testUser.id }})
    // expect(orders).toHaveLength(1)
  })

  test('handles payment errors gracefully', async ({ page }) => {
    await page.goto('/checkout')

    // Use Stripe test card for declined payment
    await page.fill('[name="cardNumber"]', '4000 0000 0000 0002')
    await page.fill('[name="cardExpiry"]', '12/25')
    await page.fill('[name="cardCvc"]', '123')

    await page.click('[data-testid="pay-button"]')

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Card declined')

    // Should NOT redirect
    expect(page.url()).toContain('/checkout')
  })
})
```

### Template: Testing Accessibility

```typescript
// /tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('href', '/pricing')

    await page.keyboard.press('Enter')
    await page.waitForURL('/pricing')
  })
})
```

---

## 4. SNAPSHOT TESTS (UI Consistency)

```typescript
// /tests/components/PricingCard.test.tsx
import { render } from '@testing-library/react'
import { PricingCard } from '@/components/PricingCard'

describe('PricingCard', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <PricingCard
        title="Pro"
        price={29}
        features={['Feature 1', 'Feature 2']}
      />
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
```

---

## 5. TESTING BEST PRACTICES

### AAA Pattern (Arrange, Act, Assert)
```typescript
test('adds item to cart', () => {
  // Arrange
  const cart = new Cart()
  const item = { id: '1', name: 'Product', price: 1000 }

  // Act
  cart.addItem(item)

  // Assert
  expect(cart.items).toHaveLength(1)
  expect(cart.total).toBe(1000)
})
```

### Test Naming Convention
```
✅ GOOD: 'returns 401 when user is not authenticated'
❌ BAD:  'test1', 'it works'
```

### One Assertion Per Test (when possible)
```typescript
// ❌ AVOID (hard to debug which assertion failed)
test('user creation', () => {
  const user = createUser()
  expect(user.id).toBeDefined()
  expect(user.email).toContain('@')
  expect(user.role).toBe('USER')
})

// ✅ PREFER (clear failure messages)
test('assigns ID to new user', () => {
  expect(createUser().id).toBeDefined()
})

test('validates email format', () => {
  expect(createUser().email).toContain('@')
})

test('defaults to USER role', () => {
  expect(createUser().role).toBe('USER')
})
```

### Mock External Dependencies
```typescript
// Mock Stripe API
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test' }),
    },
  })),
}))
```

---

## 6. CI/CD INTEGRATION

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 7. COVERAGE GATES (package.json)

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:ci": "npm run test:unit && npm run test:e2e"
  },
  "vitest": {
    "coverage": {
      "reporter": ["text", "json", "html"],
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    }
  }
}
```

**If coverage drops below threshold → CI fails**

---

## 8. TDD WORKFLOW (ARCHITECT MODE)

```
1. Write the test (RED)
   → Describe expected behavior
   
2. Run test (it fails)
   → Confirms test works
   
3. Write minimal code to pass (GREEN)
   → Focus on passing, not perfection
   
4. Refactor (REFACTOR)
   → Clean up, optimize
   
5. Repeat
```

---

**Last Updated:** 2025-12-29  
**Test before you ship. Always.**
