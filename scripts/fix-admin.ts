import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
    const email = 'admin@vard.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Force update everything
    const user = await db.user.update({
        where: { email },
        data: {
            role: 'ADMIN',
            isVerified: true,
            passwordHash: hashedPassword
        }
    })

    console.log(`✅ Admin updated with STRONG password:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Verified: ${user.isVerified}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
