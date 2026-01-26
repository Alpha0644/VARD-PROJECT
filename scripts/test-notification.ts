import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'

async function main() {
    // 1. Get a pending mission
    const mission = await db.mission.findFirst({
        where: { status: 'PENDING' },
        include: { company: true }
    })

    if (!mission) {
        console.log('❌ No pending mission found. Create one first at /company/missions/new')
        return
    }

    // 2. Get an agent (James Bond)
    const agent = await db.agent.findFirst({
        include: { user: true }
    })

    if (!agent) {
        console.log('❌ No agent found.')
        return
    }

    console.log(`🚀 Simulating agent ${agent.user.name} accepting mission "${mission.title}"...`)

    // 3. Update DB directly (simulating API side effects)
    await db.mission.update({
        where: { id: mission.id },
        data: {
            status: 'ACCEPTED',
            agentId: agent.id
        }
    })

    // 4. Manual Trigger Pusher Event (since we're bypassing the API in this script for simplicity, 
    // or we could use fetch to call the API if the server is running, but direct DB + Pusher is more reliable for a script)

    // Note: In a real flow, the API does both. Here we do both manually to ensure the event is sent.

    console.log(`📡 Triggering Pusher event to channel: private-company-${mission.company.userId}`)

    await pusherServer.trigger(
        `private-company-${mission.company.userId}`,
        'mission:status-change',
        {
            missionId: mission.id,
            missionTitle: mission.title,
            previousStatus: 'PENDING',
            newStatus: 'ACCEPTED',
            agentName: agent.user.name,
            location: mission.location,
            timestamp: new Date().toISOString()
        }
    )

    console.log('✅ Event sent! Check your dashboard.')
}

main()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect()
    })
