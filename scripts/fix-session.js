const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const TARGET_USER_ID = 'cmjsizrw00001xdt7nzl49pls' // ID from your logs

async function main() {
    console.log(`🔧 FIXING USER SESSION: ${TARGET_USER_ID}`)

    // 1. Identify User
    const user = await prisma.user.findUnique({ where: { id: TARGET_USER_ID } })
    if (!user) {
        console.error('❌ User not found in DB! Weird sync issue?')
        return
    }
    console.log(`👤 Found User: ${user.email} (${user.role})`)

    // 2. Ensure Agent Profile
    let agent = await prisma.agent.findUnique({ where: { userId: user.id } })
    if (!agent) {
        console.log('⚠️ Missing Agent profile. Creating...')
        agent = await prisma.agent.create({
            data: {
                userId: user.id,
                cartePro: 'CNAPS-FIX-' + Date.now(),
                carteProExp: new Date('2030-01-01'),
                latitude: 48.8566,
                longitude: 2.3522
            }
        })
    } else {
        console.log('✅ Agent profile exists.')
    }

    // 3. Ensure Notifications
    const mission = await prisma.mission.findFirst({ where: { status: 'PENDING' } })
    if (mission) {
        // Clear old notifs for this mission/agent to accept clean state
        await prisma.missionNotification.deleteMany({
            where: { agentId: user.id }
        })

        await prisma.missionNotification.create({
            data: {
                agentId: user.id,
                missionId: mission.id,
                status: 'SENT'
            }
        })
        console.log(`✅ Created Notification for this user (Mission: ${mission.title})`)
    } else {
        console.log('❌ No pending mission to notify about.')
    }

    // 4. Ensure History (if needed)
    // Link some completed missions to this agent
    const completedMissions = await prisma.mission.findMany({ where: { status: 'COMPLETED' }, take: 3 })
    for (const m of completedMissions) {
        // Update mission to belong to this agent
        await prisma.mission.update({
            where: { id: m.id },
            data: { agentId: agent.id }
        })

        // Ensure logs link to this user
        await prisma.missionLog.updateMany({
            where: { missionId: m.id },
            data: { userId: user.id }
        })
    }
    console.log(`✅ Linked ${completedMissions.length} history missions to this user.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
