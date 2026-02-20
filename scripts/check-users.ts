
import { db } from '@/lib/db';

async function main() {
    const agents = await db.user.findMany({ where: { role: 'AGENT' }, take: 5 });
    const companies = await db.user.findMany({ where: { role: 'COMPANY' }, take: 5 });

    console.log('--- AGENTS ---');
    agents.forEach(a => console.log(`Email: ${a.email}, Password: (hash), Verified: ${a.isVerified}`));

    console.log('\n--- COMPANIES ---');
    companies.forEach(c => console.log(`Email: ${c.email}, Password: (hash), Verified: ${c.isVerified}`));
}

main().catch(console.error);
