import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createAgent() {
    const email = 'james.bond@mi6.uk'
    const password = '007' // Simple one for testing

    // Check if exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
        console.log('✅ Agent James Bond already exists.')
        console.log('   Email:', email)
        console.log('   Password:', password)
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            name: 'James Bond',
            role: 'AGENT',
            isVerified: true,
            agentProfile: {
                create: {
                    cartePro: 'CNAPS-007-007',
                    carteProExp: new Date('2030-01-01'),
                    latitude: 48.8566,
                    longitude: 2.3522 // Paris
                }
            }
        }
    })

    console.log('🎉 Created Agent James Bond!')
    console.log('   Email:', email)
    console.log('   Password:', password)
}

createAgent()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect()
    })
