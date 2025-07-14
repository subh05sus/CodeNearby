// User tier definitions and utilities for CodeNearby API system

export type UserTier = "free" | "premium";

export interface TierLimits {
  dailyTokens: number;
  maxApiKeys: number;
  features: string[];
  support: string;
  analytics: boolean;
  repositorySearch: boolean;
  prioritySupport: boolean;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  bonus: number;
  price: {
    usd: number;
    inr: number;
  };
  features: string[];
  popular?: boolean;
}

export interface UserRecord {
  _id?: string;
  tier: UserTier;
  tokenBalance: {
    daily: number;
    purchased: number;
    total: number;
  };
  usage: {
    today: {
      tokens: number;
      requests: number;
      date: string; // YYYY-MM-DD format
    };
    total: {
      tokens: number;
      requests: number;
    };
  };
  apiKeyCount: number;
  maxApiKeys: number;
  billing: {
    currency: "USD" | "INR";
    totalSpent: number;
    purchases: Array<{
      packageId: string;
      tokens: number;
      amount: number;
      currency: string;
      date: Date;
      transactionId?: string;
    }>;
  };
  lastTokenReset: Date;
  features: {
    developerSearch: boolean;
    profileAnalysis: boolean;
    repositorySearch: boolean;
    analytics: boolean;
    prioritySupport: boolean;
  };
  verification: {
    email: boolean;
    phone: boolean;
    github: boolean;
  };
}

// Tier configurations
export const USER_TIERS: Record<UserTier, TierLimits> = {
  free: {
    dailyTokens: 1000,
    maxApiKeys: 1,
    features: [
      "Developer search",
      "Profile analysis",
      "Community support",
      "Basic queries",
    ],
    support: "Community",
    analytics: false,
    repositorySearch: false,
    prioritySupport: false,
  },
  premium: {
    dailyTokens: 2000,
    maxApiKeys: 10,
    features: [
      "All FREE features",
      "Repository search",
      "Priority support",
      "Advanced analytics",
      "Bulk purchase discounts",
    ],
    support: "Priority",
    analytics: true,
    repositorySearch: true,
    prioritySupport: true,
  },
};

// Token packages for purchase
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "basic",
    name: "BASIC",
    tokens: 5000,
    bonus: 0,
    price: { usd: 9, inr: 49 },
    features: ["Never expires", "Email support"],
  },
  {
    id: "standard",
    name: "STANDARD",
    tokens: 15000,
    bonus: 2000,
    price: { usd: 25, inr: 149 },
    popular: true,
    features: ["Never expires", "Priority support"],
  },
  {
    id: "pro",
    name: "PRO",
    tokens: 50000,
    bonus: 10000,
    price: { usd: 79, inr: 499 },
    features: ["Never expires", "Priority support", "Advanced analytics"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    tokens: 150000,
    bonus: 50000,
    price: { usd: 199, inr: 1499 },
    features: ["Never expires", "24/7 support", "Custom integrations"],
  },
];

// Utility functions
export function getTierLimits(tier: UserTier): TierLimits {
  return USER_TIERS[tier];
}

export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((pkg) => pkg.id === packageId);
}

export function getFormattedTokenPackages(currency: {
  code: "USD" | "INR";
  symbol: string;
}) {
  return TOKEN_PACKAGES.map((pkg) => ({
    ...pkg,
    formattedPrice:
      currency.code === "USD" ? `$${pkg.price.usd}` : `₹${pkg.price.inr}`,
    totalTokens: pkg.tokens + pkg.bonus,
  }));
}

export function canUpgradeUser(
  currentTier: UserTier,
  targetTier: UserTier
): boolean {
  const tiers: UserTier[] = ["free", "premium"];
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = tiers.indexOf(targetTier);
  return targetIndex > currentIndex;
}

export function shouldResetDailyTokens(user: UserRecord): boolean {
  const today = new Date().toISOString().split("T")[0];
  return user.usage.today.date !== today;
}

export function resetDailyTokens(user: UserRecord): UserRecord {
  const today = new Date().toISOString().split("T")[0];
  const tierLimits = getTierLimits(user.tier);

  return {
    ...user,
    tokenBalance: {
      ...user.tokenBalance,
      daily: tierLimits.dailyTokens,
      total: tierLimits.dailyTokens + user.tokenBalance.purchased,
    },
    usage: {
      ...user.usage,
      today: {
        tokens: 0,
        requests: 0,
        date: today,
      },
    },
    lastTokenReset: new Date(),
  };
}

export function canConsumeTokens(
  user: UserRecord,
  tokensNeeded: number
): boolean {
  return user.tokenBalance.total >= tokensNeeded;
}

export function consumeTokens(
  user: UserRecord,
  tokensUsed: number
): UserRecord {
  let dailyTokensUsed = 0;
  let purchasedTokensUsed = 0;

  // Use daily tokens first
  if (user.tokenBalance.daily > 0) {
    dailyTokensUsed = Math.min(tokensUsed, user.tokenBalance.daily);
    tokensUsed -= dailyTokensUsed;
  }

  // Then use purchased tokens
  if (tokensUsed > 0) {
    purchasedTokensUsed = Math.min(tokensUsed, user.tokenBalance.purchased);
  }

  const totalConsumed = dailyTokensUsed + purchasedTokensUsed;

  return {
    ...user,
    tokenBalance: {
      daily: user.tokenBalance.daily - dailyTokensUsed,
      purchased: user.tokenBalance.purchased - purchasedTokensUsed,
      total: user.tokenBalance.total - totalConsumed,
    },
    usage: {
      total: {
        tokens: user.usage.total.tokens + totalConsumed,
        requests: user.usage.total.requests + 1,
      },
      today: {
        ...user.usage.today,
        tokens: user.usage.today.tokens + totalConsumed,
        requests: user.usage.today.requests + 1,
      },
    },
  };
}

export function addPurchasedTokens(
  user: UserRecord,
  packageData: TokenPackage,
  transactionId?: string
): UserRecord {
  const totalTokens = packageData.tokens + packageData.bonus;
  const currency = user.billing.currency;
  const amount =
    currency === "USD" ? packageData.price.usd : packageData.price.inr;

  // Upgrade to premium tier on first purchase
  const newTier = user.tier === "free" ? "premium" : user.tier;

  return {
    ...user,
    tier: newTier,
    tokenBalance: {
      ...user.tokenBalance,
      purchased: user.tokenBalance.purchased + totalTokens,
      total: user.tokenBalance.total + totalTokens,
    },
    billing: {
      ...user.billing,
      totalSpent: user.billing.totalSpent + amount,
      purchases: [
        ...user.billing.purchases,
        {
          packageId: packageData.id,
          tokens: totalTokens,
          amount,
          currency,
          date: new Date(),
          transactionId,
        },
      ],
    },
    // Update features if tier changed
    features:
      newTier === "premium"
        ? {
            developerSearch: true,
            profileAnalysis: true,
            repositorySearch: true,
            analytics: true,
            prioritySupport: true,
          }
        : user.features,
    maxApiKeys: getTierLimits(newTier).maxApiKeys,
  };
}

export function canCreateApiKey(user: UserRecord): {
  canCreate: boolean;
  reason?: string;
  current: number;
  max: number | string;
} {
  const current = user.apiKeyCount;
  const max = user.maxApiKeys;

  if (current >= max) {
    return {
      canCreate: false,
      reason: `You've reached the maximum of ${max} API keys for your ${user.tier} tier. Upgrade to Premium for more API keys.`,
      current,
      max,
    };
  }

  return {
    canCreate: true,
    current,
    max,
  };
}

// Currency utilities
export interface Currency {
  code: "USD" | "INR";
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export function getCurrency(code: "USD" | "INR"): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

// Token cost estimation for different API endpoints
export const API_TOKEN_COSTS = {
  "/api/v1/developers": { min: 200, max: 800, average: 400 },
  "/api/v1/profile": { min: 300, max: 2000, average: 1000 },
  "/api/v1/repositories": { min: 150, max: 1200, average: 600 },
  "/api/v1/users/tier": { min: 0, max: 0, average: 0 },
};

export function getEstimatedTokenCost(endpoint: string): {
  min: number;
  max: number;
  average: number;
} {
  return (
    API_TOKEN_COSTS[endpoint as keyof typeof API_TOKEN_COSTS] || {
      min: 100,
      max: 500,
      average: 300,
    }
  );
}
