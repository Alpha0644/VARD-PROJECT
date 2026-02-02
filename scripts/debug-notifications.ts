
import { config } from 'dotenv';
import path from 'path';
import Pusher from 'pusher'; // Import Class directly

// Load env vars from .env.local or .env
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

import { updateAgentLocation, findNearbyAgents, getAgentLocation } from '../lib/redis-geo';
import { db } from '../lib/db';

async function main() {
    console.log('🔍 Starting Notification System Debug...\n');

    // 1. Check Environment Variables
    console.log('1️⃣  Checking Environment Variables:');
    const requiredVars = [
        'PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_CLUSTER',
        'NEXT_PUBLIC_PUSHER_KEY', 'NEXT_PUBLIC_PUSHER_CLUSTER'
    ];

    let missing = false;
    requiredVars.forEach(v => {
        const val = process.env[v];
        if (!val) {
            console.error(`   ❌ Missing: ${v}`);
            missing = true;
        } else {
            console.log(`   ✅ Present: ${v} = ${val.slice(0, 4)}***`);
        }
    });

    if (missing) {
        console.error('\n⚠️  Critical: Missing Pusher credentials. Notifications WILL fail.\n');
        return;
    }

    // Instantiate Pusher Manually to guarantee Env Vars are used
    const pusherServer = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!, // This caused the previous crash if undefined
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    });

    // 2. Test Redis (Geo)
    console.log('\n2️⃣  Testing Redis / Geo Location (Mock or Real):');
    const testUserId = 'debug-user-' + Date.now();
    const lat = 48.8566; // Paris
    const long = 2.3522; // Paris

    await updateAgentLocation(testUserId, lat, long);
    console.log(`   Processed updateAgentLocation for ${testUserId}`);

    const location = await getAgentLocation(testUserId);
    if (location) {
        console.log(`   ✅ Retrieved Location: ${JSON.stringify(location)}`);
    } else {
        console.error('   ❌ Failed to retrieve location (Redis/Mock persistence issue)');
    }

    const nearby = await findNearbyAgents(lat, long, 10);
    console.log(`   Nearby Agents found (Self Check): ${nearby.length}`);
    if (nearby.includes(testUserId)) {
        console.log('   ✅ Search works: Found self in nearby agents');
    } else {
        console.error('   ❌ Search failed: Did not find self in nearby list');
    }

    // 3. Test Pusher Connectivity
    console.log('\n3️⃣  Testing Pusher Server Trigger:');
    try {
        const channel = `debug-channel-${Date.now()}`;
        console.log(`   Triggering event on channel: ${channel}`);
        const res = await pusherServer.trigger(channel, 'debug-event', { message: 'Hello Terminal' });
        console.log(`   ✅ Trigger Success! Response status: ${res.status} ${res.statusText}`);
    } catch (error: any) {
        console.error('   ❌ Pusher Trigger Failed:', error.message || error);
        if (error.status) console.error(`   Status Code: ${error.status}`);
        if (error.body) console.error(`   Body: ${convertBody(error.body)}`);
    }

    console.log('\n🏁 Debug Complete.');
}

function convertBody(body: any) {
    try {
        return JSON.stringify(body);
    } catch {
        return body;
    }
}

main().catch(console.error);
