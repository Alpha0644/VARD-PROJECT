import dotenv from 'dotenv'
import path from 'path'

// 1. Load env vars FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

async function testPusher() {
    console.log('📢 Testing Pusher Connection (Attempt 3)...')

    // 2. Import Pusher AFTER env vars are loaded
    const { pusherServer } = await import('@/lib/pusher')

    const appId = process.env.PUSHER_APP_ID
    const key = process.env.PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER

    console.log(`🔹 App ID: ${appId ? '✅ Present' : '❌ MISSING'} (Len: ${appId?.length})`)
    console.log(`🔹 Key: ${key ? '✅ Present' : '❌ MISSING'} (Len: ${key?.length})`)
    console.log(`🔹 Secret: ${secret ? '✅ Present' : '❌ MISSING'} (Len: ${secret?.length})`)
    console.log(`🔹 Cluster: ${cluster ? '✅ Present' : '❌ MISSING'} (${cluster})`)

    if (!secret || !appId || !key) {
        console.error('❌ CRITICAL: Missing environment variables.')
        return
    }

    try {
        const response = await pusherServer.trigger('debug-channel', 'debug-event', {
            message: 'Verification Test',
        })

        if (response.status === 200) {
            console.log('✅ Success! Event triggered.')
        } else {
            console.error('❌ Failed with status:', response.status)
        }
    } catch (error) {
        console.error('❌ Error triggering:', error)
    }
}

testPusher()
