const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const TARGET_USER_ID = 'cmjsizrw00001xdt7nzl49pls'

async function main() {
    console.log('🔧 Forcing isVerified = true...')

    await prisma.user.update({
        where: { id: TARGET_USER_ID },
        data: { isVerified: true }
    })

    console.log('✅ User is now verified in DB')
    console.log('👉 NEXT STEP: Logout and Login again to refresh session!')
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
