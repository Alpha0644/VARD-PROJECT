import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
    const email = 'admin@vard.com'
    const password = 'admin'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            passwordHash: hashedPassword // Ensure password is reset to known value
        },
        create: {
            email,
            passwordHash: hashedPassword,
            role: 'ADMIN',
            name: 'Super Admin',
            isVerified: true
        }
    })

    console.log(`✅ Admin user ready:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${user.role}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
