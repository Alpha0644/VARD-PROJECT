
import { PrismaClient } from '@prisma/client'
import Pusher from 'pusher'

const prisma = new PrismaClient()

// Initialize Pusher (Server-side)
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
})

async function testNotification() {
    const agentEmail = 'agent@vard.test'
    const user = await prisma.user.findUnique({
        where: { email: agentEmail },
        include: { agentProfile: true }
    })

    if (!user || !user.agentProfile) {
        console.error('Agent not found')
        return
    }

    const company = await prisma.company.findFirst()
    if (!company) {
        console.error('Company not found')
        return
    }

    console.log(`🚀 Creating test mission for agent: ${agentEmail} (ID: ${user.id})`)

    const mission = await prisma.mission.create({
        data: {
            title: 'MISSION TEST MOBILE 📱',
            description: 'Verification des notifications temps réel sur mobile.',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522,
            startTime: new Date(),
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
            status: 'PENDING',
            companyId: company.id,
        }
    })

    console.log(`✅ Mission created: ${mission.id}`)

    // 1. Send to Public Channel (for available missions list)
    await pusher.trigger('public-missions', 'mission:created', {
        id: mission.id,
        title: mission.title,
        location: mission.location,
        startTime: mission.startTime,
        description: mission.description,
    })

    // 2. Send Private Notification to the Agent
    await pusher.trigger(`private-user-${user.id}`, 'mission:new', {
        missionId: mission.id,
        title: mission.title,
        message: 'Nouvelle mission disponible à proximité !',
        link: '/agent/dashboard'
    })

    console.log('🔔 Notifications sent via Pusher!')
}

testNotification()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
