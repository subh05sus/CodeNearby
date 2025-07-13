import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getUserWithTier, consumeTokens, resetDailyTokens } from "./user-tiers";

export interface ApiKeyRecord {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  hashedKey: string;
  keyPreview: string;
  tier: "free" | "verified" | "premium";
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface UsageInfo {
  tokensRemaining: number;
  tokensUsed: number;
  dailyFreeTokens: number;
  purchasedTokens: number;
  tier: string;
}

// API key validation utility with token consumption
export async function validateApiKey(
  apiKeyOrRequest: string | NextRequest,
  tokensToConsume: number = 0
): Promise<{ keyRecord: ApiKeyRecord; usage: UsageInfo } | null> {
  console.log("Starting validateApiKey function:", { tokensToConsume });

  let apiKey: string | null = null;

  if (typeof apiKeyOrRequest === "string") {
    apiKey = apiKeyOrRequest;
    console.log("Using string API key");
  } else {
    console.log("Extracting API key from request headers");
    apiKey =
      apiKeyOrRequest.headers.get("x-api-key") ||
      apiKeyOrRequest.headers.get("authorization")?.replace("Bearer ", "") ||
      null;
    console.log("Extracted API key:", apiKey ? "Found" : "Not found");
  }

  if (!apiKey) {
    console.log("No API key provided");
    return null;
  }

  if (!apiKey.startsWith("cn_")) {
    console.log("Invalid API key format, must start with 'cn_'");
    return null;
  }

  try {
    console.log("Connecting to MongoDB");
    const client = await clientPromise;
    const db = client.db("test");

    // Hash the provided key to compare with stored hash
    console.log("Hashing API key");
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    console.log("Looking up API key in database");
    const keyRecord = (await db.collection("apiKeys").findOne({
      hashedKey,
      isActive: true,
    })) as ApiKeyRecord | null;

    if (!keyRecord) {
      console.log("API key not found or inactive");
      return null;
    }
    console.log("API key found:", keyRecord.name);

    // Get user with token balance
    console.log("Getting user data for userId:", keyRecord.userId);
    const user = await getUserWithTier(keyRecord.userId);
    if (!user) {
      console.log("User not found");
      return null;
    }
    console.log("User found with tier:", user.tier);

    // Reset daily tokens if needed
    console.log("Checking if daily tokens need reset");
    await resetDailyTokens(keyRecord.userId);

    // Refresh user data after potential reset
    console.log("Refreshing user data after potential reset");
    const updatedUser = await getUserWithTier(keyRecord.userId);
    if (!updatedUser) {
      console.log("Failed to refresh user data");
      return null;
    }
    console.log("User tokens after reset check:", updatedUser.tokenBalance);

    // Check if user has enough tokens
    if (
      tokensToConsume > 0 &&
      updatedUser.tokenBalance.total < tokensToConsume
    ) {
      console.log("Insufficient tokens:", {
        required: tokensToConsume,
        available: updatedUser.tokenBalance.total,
      });
      return null; // Insufficient tokens
    }

    // Consume tokens if required
    if (tokensToConsume > 0) {
      console.log("Consuming tokens:", tokensToConsume);
      const consumeResult = await consumeTokens(
        keyRecord.userId,
        tokensToConsume
      );
      console.log("Token consumption result:", consumeResult);
      if (!consumeResult.success) {
        console.log("Failed to consume tokens");
        return null;
      }
    }

    // Update API key last used timestamp
    console.log("Updating API key last used timestamp");
    await db.collection("apiKeys").updateOne(
      { _id: keyRecord._id },
      {
        $set: {
          lastUsed: new Date(),
        },
      }
    );

    // Get final user state for usage info
    console.log("Getting final user state");
    const finalUser = await getUserWithTier(keyRecord.userId);
    if (!finalUser) {
      console.log("Failed to get final user state");
      return null;
    }

    const usage: UsageInfo = {
      tokensRemaining: finalUser.tokenBalance.total,
      tokensUsed: finalUser.usage.daily.tokensUsed,
      dailyFreeTokens: finalUser.tokenBalance.daily,
      purchasedTokens: finalUser.tokenBalance.purchased,
      tier: finalUser.tier,
    };

    console.log("Final usage info:", usage);
    return { keyRecord, usage };
  } catch (error) {
    console.error("Error validating API key:", error);
    return null;
  }
}

// Token consumption estimates per endpoint
export const TOKEN_ESTIMATES = {
  "ai-connect/developers": { min: 100, max: 800, average: 400 },
  "ai-connect/repositories": { min: 150, max: 1200, average: 600 },
  "ai-connect/profile": { min: 300, max: 2000, average: 1000 },
};

// Calculate estimated tokens for an endpoint
export function estimateTokens(
  endpoint: string,
  complexity: "simple" | "average" | "complex" = "average"
): number {
  const estimates = TOKEN_ESTIMATES[endpoint as keyof typeof TOKEN_ESTIMATES];
  if (!estimates) return 500; // Default estimate

  switch (complexity) {
    case "simple":
      return estimates.min;
    case "complex":
      return estimates.max;
    default:
      return estimates.average;
  }
}
