import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type NextRequest, NextResponse } from "next/server"
import { getRateLimit, setRateLimit } from "./redis"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface RateLimitConfig {
  limit: number;       // Maximum number of requests allowed in the window
  windowMs: number;    // Time window in milliseconds
  message?: string;    // Custom error message
}

/**
 * Rate limiting middleware for API routes using Redis
 * 
 * @param req NextRequest object
 * @param identifier Function to extract a unique identifier from the request (usually user ID or IP)
 * @param config Rate limiting configuration
 * @returns NextResponse object if rate limited, otherwise null to continue
 */
export async function rateLimit(
  req: NextRequest,
  identifier: string | (() => Promise<string>),
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const { limit, windowMs, message = "Rate limit exceeded. Please try again later." } = config

  // Get the identifier
  const key = typeof identifier === 'function'
    ? await identifier()
    : identifier

  // Get the current timestamp
  const now = Date.now()

  try {
    // Get rate limit data from Redis
    let rateLimitData = await getRateLimit(key)

    // Initialize or reset rate limit record if needed
    if (!rateLimitData || rateLimitData.resetAt < now) {
      rateLimitData = {
        count: 0,
        resetAt: now + windowMs
      }
    }

    // Increment the count
    rateLimitData.count++

    // Save updated rate limit data to Redis
    await setRateLimit(key, rateLimitData.count, rateLimitData.resetAt, windowMs)

    // Check if the rate limit has been exceeded
    if (rateLimitData.count > limit) {
      const resetAt = new Date(rateLimitData.resetAt)

      // Return a 429 Too Many Requests response
      return NextResponse.json(
        {
          error: message,
          rateLimitReset: resetAt.toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetAt.getTime() / 1000).toString(),
            'Retry-After': Math.ceil((resetAt.getTime() - now) / 1000).toString()
          }
        }
      )
    }

    // Not rate limited, continue processing the request
    return null
  } catch (error) {
    // Log the error but allow the request to proceed in case of Redis errors
    console.error("Rate limiting error:", error);
    return null;
  }
}

/**
 * Get rate limit information for a user
 * 
 * @param identifier User identifier
 * @param limit Maximum number of requests allowed
 * @returns Object with rate limit information
 */
export async function getRateLimitInfo(identifier: string, limit: number) {
  try {
    const now = Date.now()
    const rateLimitData = await getRateLimit(identifier)

    if (!rateLimitData || rateLimitData.resetAt < now) {
      return {
        used: 0,
        remaining: limit,
        resetAt: new Date(now).toISOString()
      }
    }

    const remaining = Math.max(0, limit - rateLimitData.count)

    return {
      used: rateLimitData.count,
      remaining,
      resetAt: new Date(rateLimitData.resetAt).toISOString()
    }
  } catch (error) {
    console.error("Error getting rate limit info:", error);
    // Return default values in case of error
    return {
      used: 0,
      remaining: limit,
      resetAt: new Date().toISOString(),
      error: "Failed to retrieve rate limit info"
    }
  }
}
