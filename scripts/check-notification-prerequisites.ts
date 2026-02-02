/**
 * DIAGNOSTIC SCRIPT: Check Agent Notification Prerequisites
 * 
 * Run this script to verify:
 * 1. Agent has location registered in Redis
 * 2. Agent has push subscription in DB
 * 3. Environment variables are configured
 * 
 * Usage: npx tsx scripts/check-notification-prerequisites.ts <agent-email>
 */

import { db } from '../lib/db'
import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

async function checkPrerequisites(agentEmail?: string) {
    console.log('\n========== NOTIFICATION PREREQUISITES CHECK ==========\n')

    // 1. Environment Variables
    console.log('1. ENVIRONMENT VARIABLES:')
    const envVars = [
        'NEXT_PUBLIC_VAPID_KEY',
        'VAPID_PRIVATE_KEY',
        'VAPID_SUBJECT',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
        'PUSHER_APP_ID',
        'PUSHER_KEY',
        'PUSHER_SECRET'
    ]

    for (const v of envVars) {
        const value = process.env[v]
        console.log(`   ${v}: ${value ? '✅ Set' : '❌ MISSING'}`)
    }

    // 2. Find Agent
    let agent
    if (agentEmail) {
        agent = await db.user.findFirst({
            where: { email: agentEmail },
            include: { agentProfile: true }
        })
    } else {
        // Get first agent for testing
        agent = await db.user.findFirst({
            where: { role: 'AGENT' },
            include: { agentProfile: true }
        })
    }

    console.log('\n2. AGENT PROFILE:')
    if (!agent) {
        console.log('   ❌ No agent found in database')
        return
    }
    console.log(`   ✅ Found: ${agent.email} (ID: ${agent.id})`)
    console.log(`   Agent Profile: ${agent.agentProfile ? '✅ Exists' : '❌ Missing'}`)

    // 3. Push Subscription
    console.log('\n3. PUSH SUBSCRIPTION:')
    const subscription = await db.pushSubscription.findFirst({
        where: { userId: agent.id }
    })
    if (subscription) {
        console.log(`   ✅ Subscription found`)
        console.log(`   Endpoint: ${subscription.endpoint.substring(0, 50)}...`)
    } else {
        console.log('   ❌ NO SUBSCRIPTION - Agent must click "Activer Notifs" button')
    }

    // 4. Redis Location
    console.log('\n4. REDIS GEOLOCATION:')
    try {
        const geoKey = 'agent:locations'
        const position = await redis.geopos(geoKey, agent.id) as unknown as [number, number][] | null

        if (position && position[0]) {
            console.log(`   ✅ Location registered: [${position[0][0]}, ${position[0][1]}]`)
        } else {
            console.log('   ❌ NO LOCATION - Agent must enable location sharing in dashboard')
        }
    } catch (e) {
        console.log(`   ❌ Redis error: ${e}`)
    }

    // 5. Recent Notifications
    console.log('\n5. RECENT NOTIFICATIONS (last 5):')
    const notifications = await db.missionNotification.findMany({
        where: { agentId: agent.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { mission: { select: { title: true } } }
    })

    if (notifications.length === 0) {
        console.log('   ⚠️ No notifications found for this agent')
    } else {
        for (const n of notifications) {
            console.log(`   - [${n.status}] ${n.mission.title} (${n.createdAt.toISOString()})`)
        }
    }

    // 6. All Push Subscriptions Count
    console.log('\n6. TOTAL PUSH SUBSCRIPTIONS IN SYSTEM:')
    const totalSubs = await db.pushSubscription.count()
    console.log(`   Total: ${totalSubs}`)

    // 7. All Agents with Location in Redis
    console.log('\n7. AGENTS WITH LOCATION IN REDIS:')
    try {
        const allAgents = await db.user.findMany({
            where: { role: 'AGENT' },
            select: { id: true, email: true }
        })

        let locatedCount = 0
        for (const a of allAgents.slice(0, 10)) { // Check first 10
            const pos = await redis.geopos('agent:locations', a.id)
            if (pos && pos[0]) {
                console.log(`   ✅ ${a.email}: Located`)
                locatedCount++
            }
        }

        if (locatedCount === 0) {
            console.log('   ❌ No agents have registered their location!')
        }
    } catch (e) {
        console.log(`   ❌ Redis error: ${e}`)
    }

    console.log('\n========== END DIAGNOSTIC ==========\n')
}

// Run
const agentEmail = process.argv[2]
checkPrerequisites(agentEmail)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error('Diagnostic failed:', e)
        process.exit(1)
    })
