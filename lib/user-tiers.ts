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
    dailyFreeTokens: 1000,
    features: ["developer-search"] as string[],
    description: "1,000 free tokens daily",
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
    const db = client.db("test");

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })) as UserRecord | null;

    // Initialize token system if user exists but lacks token structure
    if (user && !user.tokenBalance) {
      await initializeUserTokens(user._id);
      return getUserWithTier(userId); // Fetch again with initialized data
    }

    return user;
  } catch (error) {
    console.error("Error fetching user with tier:", error);
    return null;
  }
}

// Initialize token balance for existing users
export async function initializeUserTokens(userId: ObjectId): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const tierConfig = TIER_CONFIGS.free; // Default to free tier

    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          tier: "free",
          tierStatus: "active",
          tokenBalance: {
            purchased: 0,
            daily: tierConfig.dailyFreeTokens,
            total: tierConfig.dailyFreeTokens,
            lastDailyReset: new Date(),
          },
          limits: {
            maxApiKeys: tierConfig.maxApiKeys,
            dailyFreeTokens: tierConfig.dailyFreeTokens,
            features: tierConfig.features,
          },
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Error initializing user tokens:", error);
  }
}

// Check if user can create more API keys
export async function canUserCreateApiKey(userId: string | ObjectId): Promise<{
  canCreate: boolean;
  reason?: string;
  currentCount: number;
  maxAllowed: number;
}> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

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

    // -1 means unlimited (premium+)
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

// Reset daily free tokens
export async function resetDailyTokens(
  userId: string | ObjectId
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const user = await getUserWithTier(userId);
    if (!user) return false;

    const tierConfig = TIER_CONFIGS[user.tier];
    const now = new Date();
    const lastReset = new Date(user.tokenBalance.lastDailyReset);

    // Check if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            "tokenBalance.daily": tierConfig.dailyFreeTokens,
            "tokenBalance.lastDailyReset": now,
            "tokenBalance.total":
              user.tokenBalance.purchased + tierConfig.dailyFreeTokens,
            updatedAt: now,
          },
        }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error resetting daily tokens:", error);
    return false;
  }
}

// Consume tokens from user's balance
export async function consumeTokens(
  userId: string | ObjectId,
  tokensToConsume: number
): Promise<{ success: boolean; remainingTokens?: number; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const user = await getUserWithTier(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Reset daily tokens if needed
    await resetDailyTokens(userId);

    // Refresh user data after potential reset
    const updatedUser = await getUserWithTier(userId);
    if (!updatedUser) {
      return { success: false, error: "User not found after reset" };
    }

    if (updatedUser.tokenBalance.total < tokensToConsume) {
      return {
        success: false,
        error: `Insufficient tokens. Need ${tokensToConsume}, have ${updatedUser.tokenBalance.total}`,
        remainingTokens: updatedUser.tokenBalance.total,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Consume from daily first, then purchased
    const dailyToConsume = Math.min(
      tokensToConsume,
      updatedUser.tokenBalance.daily
    );
    const purchasedToConsume = tokensToConsume - dailyToConsume;

    const updateDoc: any = {
      $inc: {
        "tokenBalance.daily": -dailyToConsume,
        "tokenBalance.purchased": -purchasedToConsume,
        "tokenBalance.total": -tokensToConsume,
        "usage.lifetime.tokensUsed": tokensToConsume,
        "usage.lifetime.requests": 1,
      },
      $set: {
        updatedAt: new Date(),
      },
    };

    // Update daily usage
    if (updatedUser.usage.daily.date === today) {
      updateDoc.$inc["usage.daily.tokensUsed"] = tokensToConsume;
      updateDoc.$inc["usage.daily.requests"] = 1;
    } else {
      updateDoc.$set["usage.daily.tokensUsed"] = tokensToConsume;
      updateDoc.$set["usage.daily.requests"] = 1;
      updateDoc.$set["usage.daily.date"] = today;
    }

    // Update monthly usage
    if (updatedUser.usage.monthly.month === thisMonth) {
      updateDoc.$inc["usage.monthly.tokensUsed"] = tokensToConsume;
      updateDoc.$inc["usage.monthly.requests"] = 1;
    } else {
      updateDoc.$set["usage.monthly.tokensUsed"] = tokensToConsume;
      updateDoc.$set["usage.monthly.requests"] = 1;
      updateDoc.$set["usage.monthly.month"] = thisMonth;
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, updateDoc);

    if (result.modifiedCount > 0) {
      return {
        success: true,
        remainingTokens: updatedUser.tokenBalance.total - tokensToConsume,
      };
    }

    return { success: false, error: "Failed to update user tokens" };
  } catch (error) {
    console.error("Error consuming tokens:", error);
    return { success: false, error: "Database error" };
  }
}

// Add tokens to user's purchased balance
export async function addTokens(
  userId: string | ObjectId,
  tokens: number,
  amountPaid: { usd?: number; inr?: number }
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const thisMonth = new Date().toISOString().slice(0, 7);
    const now = new Date();

    const updateDoc: any = {
      $inc: {
        "tokenBalance.purchased": tokens,
        "tokenBalance.total": tokens,
        "usage.lifetime.tokensPurchased": tokens,
      },
      $set: {
        "billing.lastPurchase": now,
        updatedAt: now,
      },
    };

    // Update lifetime spending
    if (amountPaid.usd) {
      updateDoc.$inc["usage.lifetime.amountSpent.usd"] = amountPaid.usd;
    }
    if (amountPaid.inr) {
      updateDoc.$inc["usage.lifetime.amountSpent.inr"] = amountPaid.inr;
    }

    // Update monthly usage
    const user = await getUserWithTier(userId);
    if (user && user.usage.monthly.month === thisMonth) {
      updateDoc.$inc["usage.monthly.tokensPurchased"] = tokens;
      if (amountPaid.usd) {
        updateDoc.$inc["usage.monthly.amountSpent.usd"] = amountPaid.usd;
      }
      if (amountPaid.inr) {
        updateDoc.$inc["usage.monthly.amountSpent.inr"] = amountPaid.inr;
      }
    } else {
      updateDoc.$set["usage.monthly.tokensPurchased"] = tokens;
      updateDoc.$set["usage.monthly.month"] = thisMonth;
      updateDoc.$set["usage.monthly.amountSpent"] = {
        usd: amountPaid.usd || 0,
        inr: amountPaid.inr || 0,
      };
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, updateDoc);

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error adding tokens:", error);
    return false;
  }
}

// Upgrade user tier
export async function upgradeUserTier(
  userId: string | ObjectId,
  newTier: UserTier["tier"]
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const tierConfig = TIER_CONFIGS[newTier];
    const now = new Date();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          tier: newTier,
          tierStartDate: now,
          tierStatus: "active",
          "limits.maxApiKeys": tierConfig.maxApiKeys,
          "limits.dailyFreeTokens": tierConfig.dailyFreeTokens,
          "limits.features": tierConfig.features,
          updatedAt: now,
        },
      }
    );

    // Reset daily tokens with new tier limits
    await resetDailyTokens(userId);

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
    const db = client.db("test");

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
      verified: 0,
      premium: 0,
    };

    results.forEach((result) => {
      if (result._id in stats) {
        stats[result._id as UserTier["tier"]] = result.count;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error fetching tier statistics:", error);
    return {
      free: 0,
      verified: 0,
      premium: 0,
    };
  }
}
