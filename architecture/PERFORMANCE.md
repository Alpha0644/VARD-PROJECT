# PERFORMANCE & SCALABILITY v2.0

## 🚀 PERFORMANCE PHILOSOPHY

```
"Speed is a feature."
"Performance is not an afterthought, it's a requirement."
"Measure, don't guess."
```

**Goals:**
- 🎯 First Contentful Paint (FCP): < 1.5s
- 🎯 Time to Interactive (TTI): < 3.5s
- 🎯 Largest Contentful Paint (LCP): < 2.5s
- 🎯 Cumulative Layout Shift (CLS): < 0.1
- 🎯 First Input Delay (FID): < 100ms

---

## 1. FRONTEND PERFORMANCE

### Image Optimization

```tsx
// ❌ BAD: Raw <img> tag
<img src="/hero.jpg" alt="Hero" />

// ✅ GOOD: Next.js Image component (auto-optimization)
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur" // Blur-up effect while loading
  blurDataURL="data:image/..." // Low-res placeholder
/>

// ✅ BEST: With responsive sizes
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

**Rules:**
- ✅ Use WebP/AVIF format (Next.js converts automatically)
- ✅ Serve images at correct size (don't serve 4K for 400px container)
- ✅ Lazy load below-fold images (default in Next.js)
- ✅ Use `priority` sparingly (only for hero/above-fold)

### Code Splitting

```tsx
// ❌ BAD: Import heavy component directly
import HeavyChart from '@/components/HeavyChart'

// ✅ GOOD: Dynamic import (code-split)
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // If component uses window/document
})

// ✅ BETTER: Lazy load on interaction
'use client'
import { lazy, Suspense } from 'react'

const AdminPanel = lazy(() => import('@/components/AdminPanel'))

export function Settings() {
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <>
      <button onClick={() => setShowAdmin(true)}>Admin</button>
      {showAdmin && (
        <Suspense fallback={<Loading />}>
          <AdminPanel />
        </Suspense>
      )}
    </>
  )
}
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text while loading
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Bundle Size Optimization

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Tree-shaking for specific libraries
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Remove unused CSS
  experimental: {
    optimizeCss: true,
  },
})
```

**Check bundle size:**
```bash
ANALYZE=true npm run build
# Opens interactive visualization
```

### React Performance

```tsx
// ❌ BAD: Inline object creation (re-renders child)
<ExpensiveComponent style={{ color: 'red' }} />

// ✅ GOOD: Memoized style
const style = useMemo(() => ({ color: 'red' }), [])
<ExpensiveComponent style={style} />

// ❌ BAD: Inline function (re-renders child)
<Button onClick={() => handleClick(id)} />

// ✅ GOOD: Memoized callback
const handleClickMemo = useCallback(() => handleClick(id), [id])
<Button onClick={handleClickMemo} />

// ✅ BETTER: Use React.memo for expensive components
const ExpensiveList = React.memo(({ items }) => {
  return items.map(item => <ExpensiveItem key={item.id} {...item} />)
})
```

---

## 2. BACKEND PERFORMANCE

### Database Query Optimization

```typescript
// ❌ BAD: N+1 Query Problem
const users = await db.user.findMany()
for (const user of users) {
  user.posts = await db.post.findMany({ where: { userId: user.id }})
}
// Result: 1 query for users + N queries for posts = 101 queries for 100 users

// ✅ GOOD: Single query with join
const users = await db.user.findMany({
  include: {
    posts: true,
  },
})
// Result: 1 query total

// ✅ BETTER: With pagination
const users = await db.user.findMany({
  take: 20,
  skip: (page - 1) * 20,
  include: {
    posts: {
      take: 5, // Only latest 5 posts per user
      orderBy: { createdAt: 'desc' },
    },
  },
})
```

### Caching Strategy

#### 1. Client-Side Caching (React Query)
```typescript
// /lib/queries.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

#### 2. Server-Side Caching (Redis)
```typescript
// /lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key)
  if (cached) return cached

  // Fetch from database
  const fresh = await fetcher()

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(fresh))

  return fresh
}

// Usage in API route
export async function GET() {
  const products = await getCachedOrFetch(
    'products:all',
    async () => db.product.findMany(),
    300 // 5 min cache
  )

  return Response.json(products)
}
```

#### 3. Next.js Route Caching
```typescript
// app/products/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function ProductsPage() {
  const products = await db.product.findMany()
  return <ProductList products={products} />
}

// OR: On-demand revalidation
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const { path } = await req.json()
  revalidatePath(path)
  return Response.json({ revalidated: true })
}
```

### API Rate Limiting (Already covered in SECURITY.md)

### Database Indexing

```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique // Automatically creates index
  createdAt DateTime @default(now())

  @@index([createdAt]) // Index for sorting
  @@index([email, createdAt]) // Composite index
}

model Post {
  id       String @id
  userId   String
  status   String
  
  user User @relation(fields: [userId], references: [id])

  @@index([userId]) // Foreign key index (often auto-created)
  @@index([status, createdAt]) // For filtering published posts
}
```

**When to index:**
- ✅ Columns in WHERE clauses
- ✅ Columns in ORDER BY
- ✅ Foreign keys (usually auto-indexed)
- ⚠️ Don't over-index (slows writes)

---

## 3. SCALABILITY PATTERNS

### Pagination (Cursor-Based)

```typescript
// Better than offset-based for large datasets
export async function GET(req: Request) {
  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor')
  const limit = 20

  const posts = await db.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = posts.length > limit
  const items = hasMore ? posts.slice(0, -1) : posts

  return Response.json({
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  })
}
```

### Batch Operations

```typescript
// ❌ BAD: Update users one by one
for (const userId of userIds) {
  await db.user.update({
    where: { id: userId },
    data: { status: 'active' },
  })
}
// 100 users = 100 database round-trips

// ✅ GOOD: Batch update
await db.user.updateMany({
  where: {
    id: { in: userIds },
  },
  data: { status: 'active' },
})
// 1 query
```

### Background Jobs (Queue)

```typescript
// For long-running tasks (email blasts, report generation)
// Use a queue system like BullMQ or Inngest

// Example with simple queue
import { Queue } from 'bullmq'

const emailQueue = new Queue('emails', {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
})

// Add job to queue (instant response to user)
export async function POST(req: Request) {
  const { recipients, subject, body } = await req.json()

  await emailQueue.add('send-bulk', {
    recipients,
    subject,
    body,
  })

  return Response.json({ message: 'Emails queued' })
}

// Process jobs in background worker
const worker = new Worker('emails', async (job) => {
  const { recipients, subject, body } = job.data

  for (const email of recipients) {
    await sendEmail(email, subject, body)
  }
}, { connection: redisConnection })
```

### CDN for Static Assets

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    unoptimized: false, // Let Vercel optimize
  },
  assetPrefix: process.env.CDN_URL, // If using external CDN
}
```

---

## 4. PERFORMANCE MONITORING

### Web Vitals (Client-Side)

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Server-Side Metrics

```typescript
// Measure database query time
import { performance } from 'perf_hooks'

export async function GET() {
  const start = performance.now()

  const users = await db.user.findMany()

  const duration = performance.now() - start

  logger.info('Query executed', {
    query: 'findManyUsers',
    duration: `${duration.toFixed(2)}ms`,
    count: users.length,
  })

  return Response.json(users)
}
```

---

## 5. PERFORMANCE BUDGETS

### Enforce Budgets in CI

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 500 * 1024, // 500 KB
        maxEntrypointSize: 500 * 1024,
        hints: 'error', // Fail build if exceeded
      }
    }
    return config
  },
}
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/products
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## 6. PERFORMANCE CHECKLIST

```
🚀 IMAGES
- [ ] Use Next.js <Image> component
- [ ] WebP/AVIF format
- [ ] Lazy load below-fold images
- [ ] Placeholder blur for large images

📦 BUNDLE
- [ ] Code-split heavy components
- [ ] Tree-shake libraries (import only what you need)
- [ ] Bundle size < 500 KB
- [ ] Remove unused dependencies

⚡ RUNTIME
- [ ] Memoize expensive computations (useMemo)
- [ ] Memoize callbacks (useCallback)
- [ ] Use React.memo for expensive components
- [ ] Virtualize long lists (react-window)

🗄️ DATABASE
- [ ] Avoid N+1 queries (use includes)
- [ ] Paginate lists (cursor-based)
- [ ] Index frequently queried fields
- [ ] Use SELECT to limit returned fields

💾 CACHING
- [ ] Cache API responses (React Query)
- [ ] Cache database queries (Redis)
- [ ] Use Next.js revalidation (ISR)

🎯 CORE WEB VITALS
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
```

---

## 7. SCALABILITY CHECKLIST

```
📊 CAPACITY PLANNING
- [ ] Load test with realistic traffic (k6, Artillery)
- [ ] Database can handle 10x current load
- [ ] API rate limits configured
- [ ] CDN configured for static assets

🔄 HORIZONTAL SCALING
- [ ] App is stateless (can run multiple instances)
- [ ] Sessions stored in Redis (not in-memory)
- [ ] File uploads go to S3/R2 (not local disk)

⚙️ BACKGROUND JOBS
- [ ] Long tasks run in queue (not blocking requests)
- [ ] Email sending is async
- [ ] Report generation is async

🚨 GRACEFUL DEGRADATION
- [ ] App works with slow API responses
- [ ] App works with database read replicas
- [ ] Fallback UI if external service is down
```

---

**Last Updated:** 2025-12-29  
**Fast apps make happy users. Happy users make revenue.**
