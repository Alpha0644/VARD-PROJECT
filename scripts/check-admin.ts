import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    const email = 'admin@vard.com'
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, name: true }
    })

    if (!user) {
        console.log('❌ User admin@vard.com NOT FOUND')
    } else {
        console.log('✅ User found:')
        console.log(JSON.stringify(user, null, 2))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
