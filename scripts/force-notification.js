const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔗 Forcing Notification (Retry)...')

    // 1. Get Agent User
    const agentUser = await prisma.user.findUnique({ where: { email: 'agent@vard.test' } })
    if (!agentUser) throw new Error('Agent user not found')

    // 2. Get Mission (Any pending mission)
    const mission = await prisma.mission.findFirst({
        where: { status: 'PENDING' }
    })
    if (!mission) throw new Error('No pending mission found')

    console.log(`Creating notification for Agent ${agentUser.id} on Mission ${mission.id}`)

    // 3. Create Notification (Check existing first to avoid unique constraint error)
    const existing = await prisma.missionNotification.findUnique({
        where: {
            missionId_agentId: {
                missionId: mission.id,
                agentId: agentUser.id
            }
        }
    })

    if (existing) {
        console.log('✅ Notification already exists. Resetting status to SENT.')
        await prisma.missionNotification.update({
            where: { id: existing.id },
            data: { status: 'SENT' }
        })
    } else {
        await prisma.missionNotification.create({
            data: {
                agentId: agentUser.id,
                missionId: mission.id,
                status: 'SENT' // No expiresAt in schema
            }
        })
        console.log('✅ Notification CREATED.')
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
