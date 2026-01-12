const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Approving all pending documents...')

    const result = await prisma.document.updateMany({
        where: { status: 'PENDING' },
        data: { status: 'VERIFIED' }
    })

    console.log(`✅ Approved ${result.count} documents.`)
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
