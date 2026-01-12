const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Diagnostic Complet Routing\n')

    // 1. Vérifier les utilisateurs et leurs rôles
    const users = await prisma.user.findMany({
        where: {
            email: { in: ['agent@vard.test', 'agency@vard.test', 'admin@vard.test'] }
        },
        select: { email: true, role: true, isVerified: true }
    })

    console.log('📋 Utilisateurs en base :')
    users.forEach(u => {
        console.log(`  - ${u.email} : ${u.role} (Vérifié: ${u.isVerified})`)
    })

    console.log('\n✅ Test Logique Routing :')
    users.forEach(u => {
        const expectedDashboard =
            u.role === 'AGENT' ? '/agent/dashboard' :
                u.role === 'COMPANY' ? '/company/dashboard' :
                    u.role === 'ADMIN' ? '/admin' : 'UNKNOWN'

        console.log(`  ${u.email} (${u.role}) → devrait aller sur ${expectedDashboard}`)
    })

    console.log('\n🔍 Vérification Fichiers Dashboard :')
    const fs = require('fs')
    const path = require('path')

    const dashboards = [
        'app/agent/dashboard/page.tsx',
        'app/company/dashboard/page.tsx',
        'app/admin/page.tsx'
    ]

    dashboards.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, '..', file))
        console.log(`  ${exists ? '✅' : '❌'} ${file}`)
    })
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
