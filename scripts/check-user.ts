
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function check() {
    console.log('Checking for user test-agent@vard.test...')
    const user = await prisma.user.findUnique({
        where: { email: 'test-agent@vard.test' }
    })

    if (!user) {
        console.log('❌ User NOT found in DB')
    } else {
        console.log('✅ User FOUND:', user.email, user.role)
        console.log('   Password Hash:', user.passwordHash.substring(0, 10) + '...')

        const isValid = await compare('password123', user.passwordHash)
        console.log('   Password "password123" matches:', isValid ? 'YES ✅' : 'NO ❌')
    }
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
