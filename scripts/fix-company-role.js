const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Correction Rôle Entreprise\n')

    // Corriger le rôle de agency@vard.test
    const updated = await prisma.user.update({
        where: { email: 'agency@vard.test' },
        data: { role: 'COMPANY' }
    })

    console.log(`✅ Rôle corrigé pour ${updated.email}`)
    console.log(`   Ancien: AGENT → Nouveau: ${updated.role}\n`)

    // Vérification
    const users = await prisma.user.findMany({
        where: {
            email: { in: ['agent@vard.test', 'agency@vard.test', 'admin@vard.test'] }
        },
        select: { email: true, role: true }
    })

    console.log('📋 Vérification finale :')
    users.forEach(u => {
        const icon = u.role === 'AGENT' ? '🛡️' : u.role === 'COMPANY' ? '🏢' : '👨‍💼'
        const dashboard =
            u.role === 'AGENT' ? '/agent/dashboard' :
                u.role === 'COMPANY' ? '/company/dashboard' : '/admin'
        console.log(`  ${icon} ${u.email.padEnd(25)} → ${u.role.padEnd(10)} → ${dashboard}`)
    })

    console.log('\n⚠️  IMPORTANT: Déconnecte-toi et reconnecte-toi pour que le changement prenne effet!')
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
