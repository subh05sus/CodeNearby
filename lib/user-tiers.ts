// User tier definitions and utilities for CodeNearby API system
import {
  USER_TIERS as PRICING_USER_TIERS,
  TOKEN_PACKAGES as PRICING_TOKEN_PACKAGES,
  API_TOKEN_COSTS as PRICING_API_TOKEN_COSTS,
  getEstimatedTokenCost as PRICING_getEstimatedTokenCost,
  type Currency as PricingCurrency,
  CURRENCIES as PRICING_CURRENCIES,
  type UserTierId,
  type TierConfig,
  type TokenPackage as PricingTokenPackage,
} from "@/consts/pricing";

export type UserTier = UserTierId;

export type TierLimits = TierConfig;

export type TokenPackage = PricingTokenPackage;

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
export const USER_TIERS: Record<UserTier, TierLimits> = PRICING_USER_TIERS;

// Token packages for purchase
export const TOKEN_PACKAGES: TokenPackage[] = PRICING_TOKEN_PACKAGES;

// Utility functions
export function getTierLimits(tier: UserTier): TierLimits {
  return USER_TIERS[tier];
}

export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((pkg) => pkg.id === packageId);
}

export function getFormattedTokenPackages(currency: PricingCurrency) {
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
export type Currency = PricingCurrency & { name?: string };
export function getCurrency(code: "USD" | "INR"): Currency {
  return (
    PRICING_CURRENCIES.find((c) => c.code === code) || PRICING_CURRENCIES[0]
  );
}

// Token cost estimation for different API endpoints
export const API_TOKEN_COSTS = PRICING_API_TOKEN_COSTS;
export const getEstimatedTokenCost = PRICING_getEstimatedTokenCost;
