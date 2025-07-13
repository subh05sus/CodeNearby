import { Redis } from "@upstash/redis";

// Check if Redis configuration is available
const hasRedisConfig = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

if (!hasRedisConfig) {
  console.warn(
    "⚠️  Redis configuration not found. Using in-memory cache fallback for development."
  );
  console.warn(
    "⚠️  Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables for production."
  );
}

// Initialize Upstash Redis client only if configuration is available
export const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback for development when Redis is not available
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

// Clean up expired entries periodically
if (!hasRedisConfig) {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(memoryCache.entries());
    for (const [key, value] of entries) {
      if (value.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

/**
 * Cache data with expiration
 *
 * @param key The cache key
 * @param data The data to cache
 * @param expirationSeconds Time in seconds for cache expiration
 * @returns Result of the cache operation
 */
export async function cacheData(
  key: string,
  data: any,
  expirationSeconds: number = 3600
): Promise<string | null> {
  try {
    if (redis) {
      return await redis.set(key, JSON.stringify(data), {
        ex: expirationSeconds,
      });
    } else {
      // Fallback to memory cache
      const expiresAt = Date.now() + expirationSeconds * 1000;
      memoryCache.set(key, { data, expiresAt });
      return "OK";
    }
  } catch (error) {
    console.warn("Cache write failed, falling back to memory:", error);
    // Fallback to memory cache
    const expiresAt = Date.now() + expirationSeconds * 1000;
    memoryCache.set(key, { data, expiresAt });
    return "OK";
  }
}

/**
 * Get cached data
 *
 * @param key The cache key
 * @returns The cached data or null if not found
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const data = await redis.get<string>(key);
      if (!data) return null;

      try {
        // Handle case where data is already an object
        if (typeof data === "object") {
          return data as unknown as T;
        }
        return JSON.parse(data) as T;
      } catch (error) {
        console.error("Error parsing cached data:", error);
        return null;
      }
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (!cached || cached.expiresAt <= Date.now()) {
        if (cached) memoryCache.delete(key);
        return null;
      }
      return cached.data as T;
    }
  } catch (error) {
    console.warn("Cache read failed, falling back to memory:", error);
    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (!cached || cached.expiresAt <= Date.now()) {
      if (cached) memoryCache.delete(key);
      return null;
    }
    return cached.data as T;
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
  try {
    const expirySeconds = Math.ceil(windowMs / 1000);
    const rateLimitData = { count, resetAt };

    if (redis) {
      await redis.set(
        `ratelimit:${identifier}`,
        JSON.stringify(rateLimitData),
        { ex: expirySeconds }
      );
    } else {
      // Fallback to memory cache
      const expiresAt = Date.now() + expirySeconds * 1000;
      memoryCache.set(`ratelimit:${identifier}`, {
        data: rateLimitData,
        expiresAt,
      });
    }
  } catch (error) {
    console.warn(
      "Rate limit cache write failed, falling back to memory:",
      error
    );
    // Fallback to memory cache
    const expirySeconds = Math.ceil(windowMs / 1000);
    const rateLimitData = { count, resetAt };
    const expiresAt = Date.now() + expirySeconds * 1000;
    memoryCache.set(`ratelimit:${identifier}`, {
      data: rateLimitData,
      expiresAt,
    });
  }
}

/**
 * Get rate limit data
 *
 * @param identifier The user identifier
 * @returns Rate limit data or null if not found
 */
export async function getRateLimit(
  identifier: string
): Promise<{ count: number; resetAt: number } | null> {
  try {
    if (redis) {
      const data = await redis.get(`ratelimit:${identifier}`);
      if (!data) return null;

      try {
        // Handle case where data is already an object
        if (typeof data === "object" && data !== null) {
          // If data is already an object, ensure it has the expected properties
          if ("count" in data && "resetAt" in data) {
            return {
              count: Number(data.count),
              resetAt: Number(data.resetAt),
            };
          }
        }

        // If data is a string, parse it
        if (typeof data === "string") {
          return JSON.parse(data);
        }

        console.error("Unexpected data format for rate limit:", data);
        return null;
      } catch (error) {
        console.error("Error parsing rate limit data:", error);
        return null;
      }
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(`ratelimit:${identifier}`);
      if (!cached || cached.expiresAt <= Date.now()) {
        if (cached) memoryCache.delete(`ratelimit:${identifier}`);
        return null;
      }
      return cached.data as { count: number; resetAt: number };
    }
  } catch (error) {
    console.warn(
      "Rate limit cache read failed, falling back to memory:",
      error
    );
    // Fallback to memory cache
    const cached = memoryCache.get(`ratelimit:${identifier}`);
    if (!cached || cached.expiresAt <= Date.now()) {
      if (cached) memoryCache.delete(`ratelimit:${identifier}`);
      return null;
    }
    return cached.data as { count: number; resetAt: number };
  }
}

/**
 * Increment rate limit counter
 *
 * @param identifier The user identifier
 * @returns The incremented counter value
 */
export async function incrementRateLimit(identifier: string): Promise<number> {
  try {
    if (redis) {
      return await redis.incr(`ratelimit:${identifier}`);
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(`ratelimit:${identifier}`);
      if (cached && cached.expiresAt > Date.now()) {
        const rateLimitData = cached.data as { count: number; resetAt: number };
        rateLimitData.count++;
        memoryCache.set(`ratelimit:${identifier}`, {
          ...cached,
          data: rateLimitData,
        });
        return rateLimitData.count;
      } else {
        // Initialize new rate limit
        const rateLimitData = { count: 1, resetAt: Date.now() + 3600000 }; // 1 hour
        memoryCache.set(`ratelimit:${identifier}`, {
          data: rateLimitData,
          expiresAt: Date.now() + 3600000,
        });
        return 1;
      }
    }
  } catch (error) {
    console.warn("Rate limit increment failed, falling back to memory:", error);
    // Fallback to memory cache
    const cached = memoryCache.get(`ratelimit:${identifier}`);
    if (cached && cached.expiresAt > Date.now()) {
      const rateLimitData = cached.data as { count: number; resetAt: number };
      rateLimitData.count++;
      memoryCache.set(`ratelimit:${identifier}`, {
        ...cached,
        data: rateLimitData,
      });
      return rateLimitData.count;
    } else {
      // Initialize new rate limit
      const rateLimitData = { count: 1, resetAt: Date.now() + 3600000 }; // 1 hour
      memoryCache.set(`ratelimit:${identifier}`, {
        data: rateLimitData,
        expiresAt: Date.now() + 3600000,
      });
      return 1;
    }
  }
}
