/**
 * OMEGA Protocol v3.0 - E2E Test Data Seeding
 * Creates pre-configured test accounts for Playwright E2E tests
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding E2E test data...')

    // Clean up existing test data (in correct order due to foreign keys)
    await prisma.document.deleteMany({
        where: {
            user: {
                email: {
                    in: [
                        'admin@vard.test',
                        'test-agent@vard.test',
                        'test-company@vard.test',
                    ],
                },
            },
        },
    })

    await prisma.mission.deleteMany({
        where: {
            OR: [
                { company: { user: { email: 'test-company@vard.test' } } },
                { agent: { user: { email: 'test-agent@vard.test' } } },
            ],
        },
    })

    await prisma.agent.deleteMany({
        where: { user: { email: 'test-agent@vard.test' } },
    })

    await prisma.company.deleteMany({
        where: { user: { email: 'test-company@vard.test' } },
    })

    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    'admin@vard.test',
                    'test-agent@vard.test',
                    'test-company@vard.test',
                ],
            },
        },
    })

    console.log('✅ Cleaned up existing test users')


    // 1. Create Admin User
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.create({
        data: {
            email: 'admin@vard.test',
            passwordHash: adminPassword,
            name: 'Admin Test',
            role: 'ADMIN',
            isVerified: true,
        },
    })
    console.log('✅ Created admin@vard.test')

    // 2. Create Test Agent (with Agent profile)
    const agentPassword = await hash('password123', 12)
    const agentUser = await prisma.user.create({
        data: {
            email: 'test-agent@vard.test',
            passwordHash: agentPassword,
            name: 'Test Agent',
            role: 'AGENT',
            isVerified: true,
        },
    })

    const agent = await prisma.agent.create({
        data: {
            userId: agentUser.id,
            cartePro: 'CNAPS-TEST-123456',
            carteProExp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            latitude: 48.8566, // Paris
            longitude: 2.3522,
        },
    })
    console.log('✅ Created test-agent@vard.test with agent profile')

    // 3. Create Test Company (with Company profile)
    const companyPassword = await hash('password123', 12)
    const companyUser = await prisma.user.create({
        data: {
            email: 'test-company@vard.test',
            passwordHash: companyPassword,
            name: 'Test Company',
            role: 'COMPANY',
            isVerified: true,
        },
    })

    const company = await prisma.company.create({
        data: {
            userId: companyUser.id,
            companyName: 'Test Security Agency',
            siren: '12345678200010', // Valid Luhn SIRET (from mock data)
        },
    })
    console.log('✅ Created test-company@vard.test with company profile')

    // 4. Create sample missions for history tests
    const mission1 = await prisma.mission.create({
        data: {
            title: 'Gardiennage Chantier Test',
            description: 'Mission de test pour E2E',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            endTime: new Date(Date.now() + 32 * 60 * 60 * 1000), // +8h
            status: 'PENDING',
            companyId: company.id,
        },
    })

    const mission2 = await prisma.mission.create({
        data: {
            title: 'Surveillance Magasin Test',
            description: 'Completed mission for history',
            location: 'Lyon, France',
            latitude: 45.764,
            longitude: 4.8357,
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            endTime: new Date(Date.now() - 16 * 60 * 60 * 1000),
            status: 'COMPLETED',
            companyId: company.id,
            agentId: agent.id, // Assigned to test agent
        },
    })

    console.log('✅ Created 2 sample missions')

    // 5. Create sample documents for admin validation tests
    await prisma.document.create({
        data: {
            userId: agentUser.id,
            name: 'test-cnaps.pdf',
            type: 'CNAPS',
            status: 'PENDING',
            url: '/uploads/test-cnaps.pdf',
        },
    })

    await prisma.document.create({
        data: {
            userId: companyUser.id,
            name: 'test-siren.pdf',
            type: 'SIREN_FIRM',
            status: 'VERIFIED',
            url: '/uploads/test-siren.pdf',
        },
    })

    console.log('✅ Created sample documents')

    console.log('\n🎉 E2E seed data created successfully!')
    console.log('\nTest Accounts:')
    console.log('  - admin@vard.test / admin123 (ADMIN)')
    console.log('  - test-agent@vard.test / password123 (AGENT, verified)')
    console.log('  - test-company@vard.test / password123 (COMPANY, verified)')
    console.log('\nYou can now run: npx playwright test')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
