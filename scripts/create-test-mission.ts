
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { addHours } from 'date-fns'

async function main() {
    console.log('🚀 Démarrage du script de création de mission de test...')

    // 1. Récupérer ou créer l'Agence de test
    let companyUser = await db.user.findFirst({
        where: { email: 'agency@vard.test' },
        include: { companyProfile: true }
    })

    // Fallback si pas de compte de test spécifique
    if (!companyUser) {
        console.log('⚠️ Compte agency@vard.test introuvable. Recherche d\'un compte COMPANY existant...')
        companyUser = await db.user.findFirst({
            where: { role: 'COMPANY' },
            include: { companyProfile: true }
        })
    }

    if (!companyUser || !companyUser.companyProfile) {
        console.error('❌ Aucune Agence trouvée. Veuillez créer un compte Agence via l\'interface d\'abord.')
        process.exit(1)
    }

    console.log(`✅ Agence trouvée : ${companyUser.companyProfile.companyName} (${companyUser.email})`)

    // 2. Définir la mission
    const missionData = {
        title: 'Surveillance nocturne · Lyon 2e',
        description: 'Mission de test générée automatiquement pour vérifier les notifications Push.',
        startTime: addHours(new Date(), 1), // Dans 1h
        endTime: addHours(new Date(), 5),   // Dure 4h
        location: '10 Rue de la République, Lyon, France',
        latitude: 45.764043,
        longitude: 4.835659,
        status: 'PENDING',
        companyId: companyUser.companyProfile.id
    }

    // 3. Créer en DB
    const mission = await db.mission.create({
        data: missionData
    })
    console.log(`✅ Mission créée en DB : ID ${mission.id}`)

    // 4. Déclencher Pusher (Public)
    await pusherServer.trigger('public-missions', 'mission:created', {
        ...missionData,
        id: mission.id,
        company: { companyName: companyUser.companyProfile.companyName }
    })
    console.log('📡 Événement Pusher "public-missions" envoyé.')

    // 5. Déclencher Pusher (Privé pour tous les agents)
    // On récupère quelques agents pour l'affichage, mais on envoie à tous
    const agents = await db.user.findMany({
        where: { role: 'AGENT' },
        take: 5
    })

    console.log(`📢 Envoi de notification à ${agents.length} agents détectés...`)

    for (const agent of agents) {
        const channel = `private-user-${agent.id}`
        await pusherServer.trigger(channel, 'mission:new', {
            missionId: mission.id,
            title: mission.title,
            location: mission.location,
            companyName: companyUser.companyProfile.companyName,
            startTime: mission.startTime.toISOString(),
            link: `/agent/dashboard`
        })
        console.log(`   -> Notification envoyée sur le canal : ${channel}`)
    }
    // 6. Envoyer des Push Notifications (Web + FCM)
    try {
        const { broadcastToAllAgents } = await import('@/lib/fcm')
        const result = await broadcastToAllAgents({
            title: 'Nouvelle mission disponible',
            body: `${mission.title} · ${mission.location}`,
            tag: `mission-${mission.id}`,
            data: { url: '/agent/dashboard', missionId: mission.id }
        })
        console.log(`   ✅ Push envoyé: ${result.success} succès, ${result.failed} échecs (total: ${result.total})`)
    } catch (pushError) {
        console.log('   ⚠️ Push non envoyé:', pushError)
    }

    console.log('\n🎉 TERMINE ! Vérifiez votre téléphone maintenant.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
