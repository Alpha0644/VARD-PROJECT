
import { db } from '@/lib/db'

async function main() {
    console.log('🔍 Finding latest user...')
    const user = await db.user.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { documents: true }
    })

    if (!user) {
        console.log('❌ No user found')
        return
    }

    console.log(`✅ Found user: ${user.email} (${user.role})`)

    // Verify User
    await db.user.update({
        where: { id: user.id },
        data: { isVerified: true }
    })
    console.log('🔓 User marked as VERIFIED')

    // Verify Documents
    if (user.documents.length > 0) {
        await db.document.updateMany({
            where: { userId: user.id },
            data: { status: 'VERIFIED' }
        })
        console.log(`📄 ${user.documents.length} documents marked as VERIFIED`)
    }

    console.log('🎉 Done! User can now access the full dashboard.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
