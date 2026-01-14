import { Redis } from '@upstash/redis'

// Global in-memory store for fallback (Development only)
const globalForRedisMock = global as unknown as { redisMock: Map<string, { lat: number; long: number }> }
const redisMock = globalForRedisMock.redisMock || new Map()
if (process.env.NODE_ENV !== 'production') globalForRedisMock.redisMock = redisMock

// Initialize Redis with Fallback
let redis: Redis | null = null

try {
    if (
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN &&
        !process.env.UPSTASH_REDIS_REST_URL.includes('your-redis-url')
    ) {
        redis = Redis.fromEnv()
    }
} catch (error) {
    console.warn('Redis init failed, using fallback')
}

const GEO_KEY = 'agents:locations'

export async function updateAgentLocation(userId: string, lat: number, long: number) {
    if (redis) {
        await redis.geoadd(GEO_KEY, {
            member: userId,
            longitude: long,
            latitude: lat,
        })
    } else {
        // Mock
        redisMock.set(userId, { lat, long })
        console.log(`[MockRedis] Updated user ${userId} location to ${lat}, ${long}`)
    }
}

export async function findNearbyAgents(lat: number, long: number, radiusKm: number): Promise<string[]> {
    if (redis) {
        // GEORADIUS: Returns members within radius
        // Using unknown cast as georadius is not in @upstash/redis types but exists at runtime
        const result = await (redis as unknown as { georadius: (key: string, lng: number, lat: number, radius: number, unit: string) => Promise<string[]> })
            .georadius(GEO_KEY, long, lat, radiusKm, 'km')
        return result
    } else {
        // Mock Logic: Calculate distance using Haversine formula
        const agents: string[] = []

        for (const [userId, pos] of redisMock.entries()) {
            const dist = getDistanceFromLatLonInKm(lat, long, pos.lat, pos.long)
            if (dist <= radiusKm) {
                agents.push(userId)
            }
        }
        return agents
    }
}

// Check if agent has active location
export async function getAgentLocation(userId: string): Promise<{ lat: number; long: number } | null> {
    if (redis) {
        try {
            const result = await (redis as unknown as { geopos: (key: string, member: string) => Promise<unknown> })
                .geopos(GEO_KEY, userId)

            // Upstash returns [{lng, lat}] or [null] if not found
            if (result && Array.isArray(result) && result[0]) {
                const pos = result[0] as { lng?: number; lat?: number }
                if (pos && typeof pos.lng === 'number' && typeof pos.lat === 'number') {
                    return { lat: pos.lat, long: pos.lng }
                }
            }
            return null
        } catch (e) {
            console.error('[Redis geopos error]:', e)
            return null
        }
    } else {
        return redisMock.get(userId) || null
    }
}

// Helper for Mock distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1)
    var dLon = deg2rad(lon2 - lon1)
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in km
    return d
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
