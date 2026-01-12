const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // 1. Check for existing pending missions
    const pendingMissions = await prisma.mission.findMany({
        where: { status: 'PENDING' }
    })

    if (pendingMissions.length > 0) {
        console.log(`✅ Found ${pendingMissions.length} pending missions. Agent should see them if location matches.`)
        pendingMissions.forEach(m => console.log(`- ${m.title} (Lat: ${m.latitude}, Long: ${m.longitude})`))
        return
    }

    // 2. If no mission, create one
    console.log('⚠️ No pending missions found. Creating a TEST MISSION...')

    // Find agency
    const agency = await prisma.user.findUnique({ where: { email: 'agency@vard.test' } })
    if (!agency) {
        console.error('❌ Agency user not found! Did you seed?')
        return
    }

    const company = await prisma.company.findUnique({ where: { userId: agency.id } })
    if (!company) {
        console.error('❌ Company profile not found!')
        return
    }

    // Create mission in Paris (Default simulation location is usually Paris)
    const mission = await prisma.mission.create({
        data: {
            title: 'Mission Test Automatique',
            description: 'Mission générée pour le test manuel Agent.',
            status: 'PENDING',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522,
            startTime: new Date(Date.now() + 3600000), // +1 hour
            endTime: new Date(Date.now() + 7200000),   // +2 hours
            companyId: company.id
        }
    })

    console.log(`✅ Created Test Mission: "${mission.title}" in Paris.`)
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
