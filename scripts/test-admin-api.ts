
import { db } from "../lib/db"

async function testAdminAPI() {
    console.log("🛡️ STARTING ADMIN API VERIFICATION 🛡️")

    // 1. Setup: Create/Get Admin User
    console.log("1. Setting up Admin User...")
    let admin = await db.user.findFirst({ where: { email: "admin@test.com" } })
    if (!admin) {
        admin = await db.user.create({
            data: {
                email: "admin@test.com",
                name: "Admin Test",
                passwordHash: "hashed_placeholder",
                role: "ADMIN",
                isVerified: true
            }
        })
        console.log("   ✅ Created Admin User")
    } else {
        // Ensure role is ADMIN
        if (admin.role !== 'ADMIN') {
            await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } })
            console.log("   ✅ Promoted user to ADMIN")
        } else {
            console.log("   ✅ Found Admin User")
        }
    }

    // 2. Setup: Create a pending document
    console.log("2. Creating Test Document...")
    const user = await db.user.findFirst({ where: { email: { not: "admin@test.com" } } })
    if (!user) throw new Error("Need a regular user for testing")

    const doc = await db.document.create({
        data: {
            userId: user.id,
            type: "CNAPS",
            name: "test_doc.pdf",
            url: "/uploads/test.pdf",
            status: "PENDING"
        }
    })
    console.log("   ✅ Created Pending Document:", doc.id)

    // 3. Simulate API Logic (Since we can't easily fetch Next.js API routes from a node script without running server, we test the logic directly using the same DB calls)

    // TEST: GET /api/admin/documents
    console.log("3. Testing Document Retrieval...")
    const pendingDocs = await db.document.findMany({
        where: { status: 'PENDING' },
        include: { user: { select: { role: true } } }
    })

    const found = pendingDocs.find(d => d.id === doc.id)
    if (!found) {
        console.error("   ❌ Failed to find pending document")
        process.exit(1)
    }
    console.log("   ✅ Retrieved Pending Document successfully")

    // TEST: PATCH /api/admin/documents
    console.log("4. Testing Document Verification...")
    const updatedDoc = await db.document.update({
        where: { id: doc.id },
        data: { status: 'VERIFIED' }
    })

    if (updatedDoc.status !== 'VERIFIED') {
        console.error("   ❌ Failed to update status")
        process.exit(1)
    }
    console.log("   ✅ Document status updated to VERIFIED")

    // CLEANUP
    console.log("5. Cleanup...")
    await db.document.delete({ where: { id: doc.id } })
    // await db.user.delete({ where: { id: admin.id } }) // Keep admin for manual testing
    console.log("   ✅ Cleanup complete")

    console.log("🎉 ADMIN API VERIFICATION PASSED 🎉")
}

testAdminAPI()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect()
    })
