const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await hash('password123', 12)

    console.log('🌱 Seeding database...')

    // Create Company
    const agency = await prisma.user.upsert({
        where: { email: 'agency@vard.test' },
        update: {
            passwordHash,
            role: 'COMPANY' // Ensure role is correct even if user exists
        },
        create: {
            email: 'agency@vard.test',
            name: 'Vard Agency',
            passwordHash,
            role: 'COMPANY',
            isVerified: true,
            companyProfile: {
                create: {
                    companyName: 'Vard Security',
                    siren: '123456789'
                }
            }
        },
    })
    console.log('✅ Created Company: agency@vard.test')

    // Create Agent
    const agent = await prisma.user.upsert({
        where: { email: 'agent@vard.test' },
        update: { passwordHash },
        create: {
            email: 'agent@vard.test',
            name: 'James Bond',
            passwordHash,
            role: 'AGENT',
            isVerified: true,
            agentProfile: {
                create: {
                    cartePro: 'CNAPS-007',
                    carteProExp: new Date('2030-01-01')
                }
            }
        },
    })
    console.log('✅ Created Agent: agent@vard.test')

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@vard.test' },
        update: { passwordHash },
        create: {
            email: 'admin@vard.test',
            name: 'Admin VARD',
            passwordHash,
            role: 'ADMIN',
            isVerified: true
        },
    })
    console.log('✅ Created Admin: admin@vard.test')
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
