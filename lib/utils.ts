import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type NextRequest, NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/options"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple in-memory store for rate limiting
// In production, this should be replaced with Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  }
}

const rateLimitStore: RateLimitStore = {}

// Clean up expired rate limit records every hour
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    const now = Date.now()
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetAt < now) {
        delete rateLimitStore[key]
      }
    })
  }, 60 * 60 * 1000) // 1 hour
}

export interface RateLimitConfig {
  limit: number;       // Maximum number of requests allowed in the window
  windowMs: number;    // Time window in milliseconds
  message?: string;    // Custom error message
}

/**
 * Rate limiting middleware for API routes
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

  // Initialize or get the rate limit record
  if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
    rateLimitStore[key] = {
      count: 0,
      resetAt: now + windowMs
    }
  }

  // Increment the count
  rateLimitStore[key].count++

  // Check if the rate limit has been exceeded
  if (rateLimitStore[key].count > limit) {
    const resetAt = new Date(rateLimitStore[key].resetAt)

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
}

/**
 * Get rate limit information for a user
 * 
 * @param identifier User identifier
 * @param limit Maximum number of requests allowed
 * @returns Object with rate limit information
 */
export function getRateLimitInfo(identifier: string, limit: number) {
  const now = Date.now()

  if (!rateLimitStore[identifier] || rateLimitStore[identifier].resetAt < now) {
    return {
      used: 0,
      remaining: limit,
      resetAt: new Date(now).toISOString()
    }
  }

  const remaining = Math.max(0, limit - rateLimitStore[identifier].count)

  return {
    used: rateLimitStore[identifier].count,
    remaining,
    resetAt: new Date(rateLimitStore[identifier].resetAt).toISOString()
  }
}
