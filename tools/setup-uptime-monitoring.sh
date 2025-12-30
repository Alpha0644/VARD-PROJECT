#!/bin/bash
# UPTIME MONITORING SETUP (UptimeRobot - FREE 50 monitors)

echo "🔧 Setting up UptimeRobot for uptime monitoring..."

cat > .omega/uptime-config.json << 'EOF'
{
  "version": "3.1.0",
  "service": "UptimeRobot",
  "plan": "Free (50 monitors, 5min intervals)",
  "monitors": [
    {
      "name": "Production Homepage",
      "url": "https://yourdomain.com",
      "type": "HTTP(s)",
      "interval": 300,
      "alerts": ["email", "webhook"]
    },
    {
      "name": "API Health Check",
      "url": "https://yourdomain.com/api/health",
      "type": "HTTP(s)",
      "interval": 300,
      "expected_status": 200
    },
    {
      "name": "Database Connection",
      "url": "https://yourdomain.com/api/health/db",
      "type": "HTTP(s)",
      "interval": 300
    }
  ],
  "alert_thresholds": {
    "downtime": "immediate",
    "response_time": "> 2000ms"
  }
}
EOF

# Create health check API route
mkdir -p app/api/health

cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Internal error' },
      { status: 500 }
    )
  }
}
EOF

cat > app/api/health/db/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
EOF

echo "✅ Health check endpoints created"
echo ""
echo "📝 Next steps:"
echo "1. Create account: https://uptimerobot.com/signUp"
echo "2. Add monitors from .omega/uptime-config.json"
echo "3. Configure alert contacts (email/Slack webhook)"
echo "4. Deploy and verify: curl https://yourdomain.com/api/health"
