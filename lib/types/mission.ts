import { Mission, Company } from '@prisma/client'

// Mission type that includes the related Company data
// Matches: include: { company: true }
export type MissionWithCompany = Mission & {
    company: Company
}
