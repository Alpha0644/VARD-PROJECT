const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Fixing missing Agent Profile...')

    const agentUser = await prisma.user.findUnique({ where: { email: 'agent@vard.test' } })
    if (!agentUser) throw new Error('Agent user not found')

    let agent = await prisma.agent.findUnique({ where: { userId: agentUser.id } })

    if (!agent) {
        console.log('⚠️ Agent profile missing, creating it...')
        agent = await prisma.agent.create({
            data: {
                userId: agentUser.id,
                cartePro: 'CNAPS-007-TEST',
                carteProExp: new Date('2030-01-01')
            }
        })
        console.log('✅ Agent profile created')
    } else {
        console.log('✅ Agent profile already exists')
    }

    // Now create history
    console.log('\n🎯 Creating TEST HISTORY (Completed Missions)...')

    const companyUser = await prisma.user.findUnique({ where: { email: 'agency@vard.test' } })
    if (!companyUser) throw new Error('Company user not found')

    const company = await prisma.company.findUnique({ where: { userId: companyUser.id } })
    if (!company) throw new Error('Company profile not found')

    // Create 3 past missions (COMPLETED)
    const testMissions = [
        { title: 'Surveillance Nocturne Louvre', location: 'Paris Louvre', days: 5 },
        { title: 'Gardiennage Centre Commercial', location: 'La Défense', days: 3 },
        { title: 'Sécurité Événement VIP', location: 'Champs-Élysées', days: 1 },
    ]

    for (const m of testMissions) {
        const startTime = new Date(Date.now() - m.days * 24 * 3600000 - 7200000)
        const endTime = new Date(Date.now() - m.days * 24 * 3600000)

        const mission = await prisma.mission.create({
            data: {
                title: m.title,
                description: `Mission test pour validation historique - ${m.title}`,
                status: 'COMPLETED',
                location: m.location,
                latitude: 48.8566,
                longitude: 2.3522,
                startTime,
                endTime,
                companyId: company.id,
                agentId: agent.id
            }
        })

        // Create Audit Trail
        await prisma.missionLog.create({
            data: {
                missionId: mission.id,
                userId: agentUser.id,
                previousStatus: 'PENDING',
                newStatus: 'ACCEPTED',
                comment: 'Mission acceptée par l\'agent'
            }
        })

        await prisma.missionLog.create({
            data: {
                missionId: mission.id,
                userId: agentUser.id,
                previousStatus: 'ACCEPTED',
                newStatus: 'COMPLETED',
                comment: 'Mission terminée avec succès',
                latitude: 48.8566,
                longitude: 2.3522
            }
        })

        console.log(`✅ Created: ${m.title} (${m.days} days ago)`)
    }

    console.log('\n🎉 TEST HISTORY READY!')
    console.log('👉 Go to: http://localhost:3001/agent/history')
    console.log('👉 Or: http://localhost:3001/company/history')
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
