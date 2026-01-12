const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 OMEGA TEST SETUP - Phase 1.4\n')

    // 1. VERIFY AND FIX PROFILES
    console.log('📋 Step 1: Checking User Profiles...')

    const agentUser = await prisma.user.findUnique({ where: { email: 'agent@vard.test' } })
    const companyUser = await prisma.user.findUnique({ where: { email: 'agency@vard.test' } })

    if (!agentUser || !companyUser) {
        throw new Error('❌ Users not found! Run: npx prisma db seed')
    }

    // Fix Agent Profile
    let agent = await prisma.agent.findUnique({ where: { userId: agentUser.id } })
    if (!agent) {
        console.log('  ⚠️ Creating missing Agent profile...')
        agent = await prisma.agent.create({
            data: {
                userId: agentUser.id,
                cartePro: 'CNAPS-007-TEST',
                carteProExp: new Date('2030-01-01'),
                latitude: 48.8566,
                longitude: 2.3522
            }
        })
        console.log('  ✅ Agent profile created')
    } else {
        console.log('  ✅ Agent profile exists')
    }

    // Fix Company Profile
    let company = await prisma.company.findUnique({ where: { userId: companyUser.id } })
    if (!company) {
        console.log('  ⚠️ Creating missing Company profile...')
        company = await prisma.company.create({
            data: {
                userId: companyUser.id,
                companyName: 'Vard Security',
                siren: '123456789'
            }
        })
        console.log('  ✅ Company profile created')
    } else {
        console.log('  ✅ Company profile exists')
    }

    // 2. CREATE ACTIVE MISSIONS FOR MATCHING TEST
    console.log('\n📍 Step 2: Creating ACTIVE Missions (for Matching)...')

    const activeMission = await prisma.mission.create({
        data: {
            title: 'Mission Test Matching',
            description: 'TEST - À accepter pour valider le flux',
            status: 'PENDING',
            location: 'Paris Centre',
            latitude: 48.8566,
            longitude: 2.3522,
            startTime: new Date(Date.now() + 3600000), // +1h
            endTime: new Date(Date.now() + 7200000),   // +2h
            companyId: company.id
        }
    })
    console.log(`  ✅ Created: ${activeMission.title}`)

    // Create notification for agent
    const notification = await prisma.missionNotification.upsert({
        where: {
            missionId_agentId: {
                missionId: activeMission.id,
                agentId: agentUser.id
            }
        },
        update: { status: 'SENT' },
        create: {
            agentId: agentUser.id,
            missionId: activeMission.id,
            status: 'SENT'
        }
    })
    console.log(`  ✅ Notification created`)

    // 3. CREATE COMPLETED MISSIONS FOR HISTORY TEST
    console.log('\n📜 Step 3: Creating COMPLETED Missions (for History)...')

    const historyMissions = [
        { title: 'Surveillance Nocturne Louvre', location: 'Paris Louvre', days: 5 },
        { title: 'Gardiennage Centre Commercial', location: 'La Défense', days: 3 },
        { title: 'Sécurité Événement VIP', location: 'Champs-Élysées', days: 1 },
    ]

    for (const m of historyMissions) {
        const startTime = new Date(Date.now() - m.days * 24 * 3600000 - 7200000)
        const endTime = new Date(Date.now() - m.days * 24 * 3600000)

        const mission = await prisma.mission.create({
            data: {
                title: m.title,
                description: `Mission test pour validation historique`,
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
        await prisma.missionLog.createMany({
            data: [
                {
                    missionId: mission.id,
                    userId: agentUser.id,
                    previousStatus: null,
                    newStatus: 'ACCEPTED',
                    comment: 'Mission acceptée'
                },
                {
                    missionId: mission.id,
                    userId: agentUser.id,
                    previousStatus: 'ACCEPTED',
                    newStatus: 'COMPLETED',
                    comment: 'Mission terminée avec succès',
                    latitude: 48.8566,
                    longitude: 2.3522
                }
            ]
        })

        console.log(`  ✅ ${m.title} (${m.days} days ago)`)
    }

    console.log('\n✨ SETUP COMPLETE!\n')
    console.log('🎯 TEST MATCHING:')
    console.log('   1. Go to: http://localhost:3001/dashboard')
    console.log('   2. You should see "📬 Propositions Reçues (1)"')
    console.log('   3. Click ACCEPTER to test mission flow\n')
    console.log('📜 TEST HISTORY:')
    console.log('   1. Go to: http://localhost:3001/agent/history')
    console.log('   2. You should see 3 completed missions\n')
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
