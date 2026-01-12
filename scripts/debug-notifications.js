const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔍 DIAGNOSTIC: Checking Notifications...')

    const user = await prisma.user.findUnique({ where: { email: 'agent@vard.test' } })
    if (!user) {
        console.error('❌ User agent@vard.test NOT FOUND')
        return
    }
    console.log(`👤 Agent User ID: ${user.id}`)

    const notifs = await prisma.missionNotification.findMany({
        where: { agentId: user.id },
        include: { mission: true }
    })

    console.log(`📬 Notifications found for this ID: ${notifs.length}`)

    notifs.forEach(n => {
        console.log(`   - Notif ID: ${n.id}`)
        console.log(`     Status: ${n.status}`)
        console.log(`     Mission: ${n.mission.title}`)
        console.log(`     Match? ${n.agentId === user.id ? 'YES' : 'NO'}`)
    })

    if (notifs.length === 0) {
        console.log('⚠️ No notifications found. Checking ALL notifications in table...')
        const all = await prisma.missionNotification.findMany()
        console.log(`Total notifications in DB: ${all.length}`)
        all.forEach(n => console.log(`   - orphan notif for agentId: ${n.agentId}`))
    }
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
