const fs = require('fs');
const path = require('path');

const envContent = `
# Environment variables
DATABASE_URL="file:./dev.db"

# Auth.js / NextAuth
# Fixed secret for persistent sessions
AUTH_SECRET="92d638ac2d5902fce2efe4ff2d7f3458407e1cbc1fc3c814318e374a0d889c06"
NEXTAUTH_URL="http://localhost:3000"

# Resend (Email Service)
RESEND_API_KEY="re_123456789"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
`.trim();

fs.writeFileSync(path.join(process.cwd(), '.env'), envContent, 'utf8');
console.log('.env file rewritten successfully.');
