import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Cache data with expiration
 * 
 * @param key The cache key
 * @param data The data to cache
 * @param expirationSeconds Time in seconds for cache expiration
 * @returns Result of the Redis set operation
 */
export async function cacheData(key: string, data: any, expirationSeconds: number = 3600): Promise<string | null> {
    return await redis.set(key, JSON.stringify(data), { ex: expirationSeconds });
}

/**
 * Get cached data
 * 
 * @param key The cache key
 * @returns The cached data or null if not found
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
    const data = await redis.get<string>(key);
    if (!data) return null;

    try {
        // Handle case where data is already an object
        if (typeof data === 'object') {
            return data as unknown as T;
        }
        return JSON.parse(data) as T;
    } catch (error) {
        console.error('Error parsing cached data:', error);
        return null;
    }
}

/**
 * Cache rate limit data
 * 
 * @param identifier The user identifier
 * @param count Current request count
 * @param resetAt Timestamp when the rate limit resets
 * @param windowMs Time window in milliseconds
 */
export async function setRateLimit(
    identifier: string,
    count: number,
    resetAt: number,
    windowMs: number
): Promise<void> {
    const expirySeconds = Math.ceil(windowMs / 1000);
    const rateLimitData = { count, resetAt };
    await redis.set(`ratelimit:${identifier}`, JSON.stringify(rateLimitData), { ex: expirySeconds });
}

/**
 * Get rate limit data
 * 
 * @param identifier The user identifier
 * @returns Rate limit data or null if not found
 */
export async function getRateLimit(identifier: string): Promise<{ count: number; resetAt: number } | null> {
    const data = await redis.get(`ratelimit:${identifier}`);
    if (!data) return null;

    try {
        // Handle case where data is already an object
        if (typeof data === 'object' && data !== null) {
            // If data is already an object, ensure it has the expected properties
            if ('count' in data && 'resetAt' in data) {
                return {
                    count: Number(data.count),
                    resetAt: Number(data.resetAt)
                };
            }
        }

        // If data is a string, parse it
        if (typeof data === 'string') {
            return JSON.parse(data);
        }

        console.error('Unexpected data format for rate limit:', data);
        return null;
    } catch (error) {
        console.error('Error parsing rate limit data:', error);
        return null;
    }
}

/**
 * Increment rate limit counter
 * 
 * @param identifier The user identifier
 * @returns The incremented counter value
 */
export async function incrementRateLimit(identifier: string): Promise<number> {
    return await redis.incr(`ratelimit:${identifier}`);
}