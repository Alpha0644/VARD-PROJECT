
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function check() {
    console.log('Checking test-company@vard.test...')
    const user = await prisma.user.findUnique({
        where: { email: 'test-company@vard.test' }
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    console.log('User found:', user.email, user.role)
    console.log('Hash:', user.passwordHash)

    const isValid = await compare('password123', user.passwordHash || '')
    console.log('Company Password valid:', isValid)

    console.log('\nChecking test-agent@vard.test...')
    const agent = await prisma.user.findUnique({
        where: { email: 'test-agent@vard.test' }
    })

    if (agent) {
        console.log('Agent found:', agent.email, agent.role)
        const isAgentValid = await compare('password123', agent.passwordHash || '')
        console.log('Agent Password valid:', isAgentValid)
    } else {
        console.log('Agent NOT found')
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
