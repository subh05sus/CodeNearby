import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export interface UserTier {
  tier: "free" | "verified" | "premium";
  tierStartDate: Date;
  tierStatus: "active" | "suspended";
  tokenBalance: {
    purchased: number; // Tokens bought through top-ups
    daily: number; // Free daily tokens (reset daily)
    total: number; // purchased + daily
    lastDailyReset: Date;
  };
  usage: {
    daily: {
      tokensUsed: number;
      requests: number;
      date: string; // YYYY-MM-DD
    };
    monthly: {
      tokensUsed: number;
      tokensPurchased: number;
      requests: number;
      amountSpent: {
        usd: number;
        inr: number;
      };
      month: string; // YYYY-MM
    };
    lifetime: {
      tokensUsed: number;
      tokensPurchased: number;
      requests: number;
      amountSpent: {
        usd: number;
        inr: number;
      };
      apiKeysCreated: number;
    };
  };
  limits: {
    maxApiKeys: number;
    dailyFreeTokens: number;
    features: string[];
  };
  billing: {
    paymentMethods: Array<{
      id: string;
      type: string;
      last4?: string;
      expiryMonth?: number;
      expiryYear?: number;
    }>;
    defaultPaymentMethod: string | null;
    lastPurchase: Date | null;
  };
  preferences: {
    emailNotifications: boolean;
    lowTokenAlerts: boolean;
    marketingEmails: boolean;
    currency: "USD" | "INR";
    tokenAlertThreshold: number; // Alert when tokens drop below this
  };
}

export interface UserRecord {
  _id: ObjectId;
  email: string;
  name?: string;
  tier: UserTier["tier"];
  tierStartDate: Date;
  tierStatus: UserTier["tierStatus"];
  tokenBalance: UserTier["tokenBalance"];
  usage: UserTier["usage"];
  limits: UserTier["limits"];
  billing: UserTier["billing"];
  preferences: UserTier["preferences"];
  createdAt: Date;
  updatedAt: Date;
}

// Tier configurations for token-based system
export const TIER_CONFIGS = {
  free: {
    maxApiKeys: 1,
    dailyFreeTokens: 500,
    features: ["developer-search"] as string[],
    description: "500 free tokens daily",
  },
  verified: {
    maxApiKeys: 3,
    dailyFreeTokens: 1000,
    features: ["developer-search", "repository-search", "basic-ai"] as string[],
    description: "1,000 free tokens daily + token purchases",
  },
  premium: {
    maxApiKeys: 10,
    dailyFreeTokens: 2000,
    features: [
      "developer-search",
      "repository-search",
      "profile-analysis",
      "premium-ai",
      "analytics",
      "bulk-discounts",
    ] as string[],
    description: "2,000 free tokens daily + bulk discounts",
  },
};

// Get user by ID with tier information
export async function getUserWithTier(
  userId: string | ObjectId
): Promise<UserRecord | null> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })) as UserRecord | null;

    return user;
  } catch (error) {
    console.error("Error fetching user with tier:", error);
    return null;
  }
}

// Check if user can create API key
export async function canUserCreateApiKey(userId: string | ObjectId): Promise<{
  canCreate: boolean;
  reason?: string;
  currentCount: number;
  maxAllowed: number;
}> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await getUserWithTier(userId);
    if (!user) {
      return {
        canCreate: false,
        reason: "User not found",
        currentCount: 0,
        maxAllowed: 0,
      };
    }

    // Get current API key count
    const currentApiKeys = await db.collection("apiKeys").countDocuments({
      userId: new ObjectId(userId),
      isActive: true,
    });

    const tierConfig = TIER_CONFIGS[user.tier];
    const maxAllowed = tierConfig.maxApiKeys;

    // -1 means unlimited (enterprise)
    if (maxAllowed === -1) {
      return {
        canCreate: true,
        currentCount: currentApiKeys,
        maxAllowed: -1,
      };
    }

    const canCreate = currentApiKeys < maxAllowed;

    return {
      canCreate,
      reason: canCreate
        ? undefined
        : `Maximum ${maxAllowed} API keys allowed for ${user.tier} tier`,
      currentCount: currentApiKeys,
      maxAllowed,
    };
  } catch (error) {
    console.error("Error checking API key creation permission:", error);
    return {
      canCreate: false,
      reason: "Error checking permissions",
      currentCount: 0,
      maxAllowed: 0,
    };
  }
}

// Check if user can access feature
export function canUserAccessFeature(
  userTier: UserTier["tier"],
  feature: string
): boolean {
  const tierConfig = TIER_CONFIGS[userTier];

  // Check if tier has all features
  if (tierConfig.features.includes("all-features")) {
    return true;
  }

  // Check specific feature
  return tierConfig.features.includes(feature);
}

// Update user's daily usage
export async function updateUserUsage(
  userId: string | ObjectId,
  type: "requests" | "tokens",
  amount: number
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const updateDoc: any = {
      $inc: {
        [`usage.lifetime.${type}`]: amount,
      },
      $set: {
        updatedAt: new Date(),
      },
    };

    // Handle daily usage with date check
    const user = await getUserWithTier(userId);
    if (user && user.usage.daily.date === today) {
      updateDoc.$inc[`usage.daily.${type}`] = amount;
    } else {
      updateDoc.$set[`usage.daily.${type}`] = amount;
      updateDoc.$set["usage.daily.date"] = today;
    }

    // Handle monthly usage with month check
    if (user && user.usage.monthly.month === thisMonth) {
      updateDoc.$inc[`usage.monthly.${type}`] = amount;
    } else {
      updateDoc.$set[`usage.monthly.${type}`] = amount;
      updateDoc.$set["usage.monthly.month"] = thisMonth;
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, updateDoc);

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating user usage:", error);
    return false;
  }
}

// Check if user has exceeded daily limits
export async function hasUserExceededLimits(
  userId: string | ObjectId
): Promise<{
  exceeded: boolean;
  limits: {
    requests: { current: number; max: number; exceeded: boolean };
    tokens: { current: number; max: number; exceeded: boolean };
  };
}> {
  try {
    const user = await getUserWithTier(userId);
    if (!user) {
      return {
        exceeded: true,
        limits: {
          requests: { current: 0, max: 0, exceeded: true },
          tokens: { current: 0, max: 0, exceeded: true },
        },
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const tierConfig = TIER_CONFIGS[user.tier];

    // Reset daily usage if it's a new day
    let dailyRequests = user.usage.daily.requests;
    let dailyTokens = user.usage.daily.tokens;

    if (user.usage.daily.date !== today) {
      dailyRequests = 0;
      dailyTokens = 0;
    }

    const requestsExceeded = dailyRequests >= tierConfig.dailyRequests;
    const tokensExceeded = dailyTokens >= tierConfig.dailyTokens;

    return {
      exceeded: requestsExceeded || tokensExceeded,
      limits: {
        requests: {
          current: dailyRequests,
          max: tierConfig.dailyRequests,
          exceeded: requestsExceeded,
        },
        tokens: {
          current: dailyTokens,
          max: tierConfig.dailyTokens,
          exceeded: tokensExceeded,
        },
      },
    };
  } catch (error) {
    console.error("Error checking user limits:", error);
    return {
      exceeded: true,
      limits: {
        requests: { current: 0, max: 0, exceeded: true },
        tokens: { current: 0, max: 0, exceeded: true },
      },
    };
  }
}

// Upgrade user tier
export async function upgradeUserTier(
  userId: string | ObjectId,
  newTier: UserTier["tier"],
  subscriptionId?: string,
  customerId?: string
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const tierConfig = TIER_CONFIGS[newTier];

    const updateDoc: any = {
      $set: {
        tier: newTier,
        tierStartDate: new Date(),
        tierEndDate:
          newTier === "free"
            ? null
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        tierStatus: "active",
        "limits.dailyRequests": tierConfig.dailyRequests,
        "limits.dailyTokens": tierConfig.dailyTokens,
        "limits.maxApiKeys": tierConfig.maxApiKeys,
        "limits.features": tierConfig.features,
        updatedAt: new Date(),
      },
    };

    if (subscriptionId) {
      updateDoc.$set["billing.subscriptionId"] = subscriptionId;
    }

    if (customerId) {
      updateDoc.$set["billing.customerId"] = customerId;
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, updateDoc);

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error upgrading user tier:", error);
    return false;
  }
}

// Get tier statistics
export async function getTierStatistics(): Promise<
  Record<UserTier["tier"], number>
> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await db.collection("users").aggregate(pipeline).toArray();

    const stats: Record<UserTier["tier"], number> = {
      free: 0,
      starter: 0,
      developer: 0,
      business: 0,
      enterprise: 0,
    };

    results.forEach((result) => {
      if (result._id && stats.hasOwnProperty(result._id)) {
        stats[result._id as UserTier["tier"]] = result.count;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting tier statistics:", error);
    return {
      free: 0,
      starter: 0,
      developer: 0,
      business: 0,
      enterprise: 0,
    };
  }
}
