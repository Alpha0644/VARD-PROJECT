#!/bin/bash
# AUTO-SETUP SENTRY (Free Tier - 5K events/month)

echo "🔧 Setting up Sentry for production monitoring..."

# Check if already configured
if grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.example; then
  echo "✅ Sentry already configured"
  exit 0
fi

# Add to .env.example
cat >> .env.example << 'EOF'

# Sentry (Production Monitoring - FREE tier)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
EOF

# Create Sentry config
cat > sentry.client.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Free tier: 5K events/month
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Only report errors in production
  enabled: process.env.NODE_ENV === 'production',
  
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  
  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Session replay (limited in free tier)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filter out low-value errors
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
  ],
  
  beforeSend(event, hint) {
    // Don't send dev errors
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    return event;
  },
});
EOF

cat > sentry.server.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
});
EOF

cat > sentry.edge.config.ts << 'EOF'
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
EOF

echo "✅ Sentry configured (FREE tier - 5K events/month)"
echo ""
echo "📝 Next steps:"
echo "1. Create account: https://sentry.io/signup/"
echo "2. Create project (select Next.js)"
echo "3. Copy DSN to .env.local"
echo "4. Install: npm install @sentry/nextjs --save"
echo "5. npx @sentry/wizard@latest -i nextjs"
