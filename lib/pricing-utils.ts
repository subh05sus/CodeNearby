// Utility functions for token-based pricing and currency detection

export interface TokenPackage {
  id: string;
  name: string;
  description: string;
  tokens: number;
  price: {
    usd: number;
    inr: number;
  };
  bonus?: number; // Extra tokens for larger packages
  popular?: boolean;
  features: string[]; // Add features array
}

export interface UserTier {
  id: string;
  name: string;
  description: string;
  maxApiKeys: number;
  features: string[];
  dailyFreeTokens: number; // Free tokens per day
}

export interface CurrencyInfo {
  code: "USD" | "INR";
  symbol: "$" | "₹";
  locale: string;
}

// Token packages for top-up
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Small top-up for light usage",
    tokens: 5000,
    price: { usd: 9, inr: 49 },
    features: [
      "5,000 API tokens",
      "Never expires",
      "All API endpoints",
      "Email support",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Good value for regular users",
    tokens: 15000,
    price: { usd: 25, inr: 149 },
    bonus: 2000, // 17k total tokens
    popular: true,
    features: [
      "15,000 API tokens",
      "+2,000 bonus tokens",
      "Never expires",
      "All API endpoints",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best value for heavy usage",
    tokens: 50000,
    price: { usd: 79, inr: 499 },
    bonus: 10000, // 60k total tokens
    features: [
      "50,000 API tokens",
      "+10,000 bonus tokens",
      "Never expires",
      "All API endpoints",
      "Priority support",
      "Advanced analytics",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Large scale usage",
    tokens: 150000,
    price: { usd: 199, inr: 1499 },
    bonus: 50000, // 200k total tokens
    features: [
      "150,000 API tokens",
      "+50,000 bonus tokens",
      "Never expires",
      "All API endpoints",
      "24/7 support",
      "Advanced analytics",
      "Custom integrations",
    ],
  },
];

// User tiers (account levels, not subscriptions)
export const USER_TIERS: UserTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Start with free daily tokens",
    maxApiKeys: 1,
    dailyFreeTokens: 1000,
    features: [
      "1,000 free tokens daily",
      "Developer search",
      "Community support",
      "1 API key",
    ],
  },
  {
    id: "verified",
    name: "Verified",
    description: "Verified users with phone/email",
    maxApiKeys: 3,
    dailyFreeTokens: 1000,
    features: [
      "1,000 free tokens daily",
      "All basic endpoints",
      "Email support",
      "3 API keys",
      "Purchase token packages",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Active users with purchases",
    maxApiKeys: 10,
    dailyFreeTokens: 2000,
    features: [
      "2,000 free tokens daily",
      "All endpoints + AI insights",
      "Priority support",
      "10 API keys",
      "Advanced analytics",
      "Bulk discounts",
    ],
  },
];

// Detect user's country/currency preference
export async function detectUserCurrency(
  request?: Request
): Promise<CurrencyInfo> {
  // Default to USD
  let currency: CurrencyInfo = {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  };

  try {
    // Method 1: Check request headers for country info
    if (request) {
      const countryHeader =
        request.headers.get("cf-ipcountry") ||
        request.headers.get("x-vercel-ip-country") ||
        request.headers.get("x-country-code");

      if (countryHeader === "IN") {
        currency = {
          code: "INR",
          symbol: "₹",
          locale: "hi-IN",
        };
      }
    }

    // Method 2: Check browser timezone (fallback for client-side)
    if (typeof window !== "undefined") {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (
        timezone.includes("Asia/Kolkata") ||
        timezone.includes("Asia/Calcutta")
      ) {
        currency = {
          code: "INR",
          symbol: "₹",
          locale: "hi-IN",
        };
      }
    }

    return currency;
  } catch (error) {
    console.error("Error detecting user currency:", error);
    return currency; // Default to USD on error
  }
}

// Client-side currency detection
export function detectClientCurrency(): CurrencyInfo {
  try {
    // Check browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Check browser language
    const language = navigator.language || navigator.languages?.[0];

    // Check if user is likely in India
    const isIndianTimezone =
      timezone.includes("Asia/Kolkata") || timezone.includes("Asia/Calcutta");
    const isIndianLanguage =
      language?.startsWith("hi") || language?.includes("IN");

    if (isIndianTimezone || isIndianLanguage) {
      return {
        code: "INR",
        symbol: "₹",
        locale: "hi-IN",
      };
    }
  } catch (error) {
    console.error("Error detecting client currency:", error);
  }

  // Default to USD
  return {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  };
}

// Format price for token packages
export function formatTokenPrice(
  pkg: TokenPackage,
  currency: CurrencyInfo
): string {
  const price = currency.code === "INR" ? pkg.price.inr : pkg.price.usd;

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Get token package by ID
export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((pkg) => pkg.id === packageId);
}

// Get user tier by ID
export function getUserTier(tierId: string): UserTier | undefined {
  return USER_TIERS.find((tier) => tier.id === tierId);
}

// Get all token packages with formatted prices
export function getFormattedTokenPackages(currency: CurrencyInfo) {
  return TOKEN_PACKAGES.map((pkg) => ({
    ...pkg,
    formattedPrice: formatTokenPrice(pkg, currency),
    totalTokens: pkg.tokens + (pkg.bonus || 0),
    pricePerToken:
      (currency.code === "INR" ? pkg.price.inr : pkg.price.usd) /
      (pkg.tokens + (pkg.bonus || 0)),
  }));
}

// Calculate token cost
export function calculateTokenCost(
  tokens: number,
  currency: CurrencyInfo
): number {
  // Base rate: approximately $0.001 per token or ₹0.08 per token
  const baseRate = currency.code === "INR" ? 0.08 : 0.001;
  return tokens * baseRate;
}

// Token consumption rates per endpoint
export const TOKEN_CONSUMPTION = {
  "ai-connect/developers": {
    base: 100, // Base tokens for query processing
    perResult: 50, // Additional tokens per developer result
    maxTokens: 800,
  },
  "ai-connect/repositories": {
    base: 150,
    perResult: 75,
    maxTokens: 1200,
  },
  "ai-connect/profile": {
    base: 300,
    perAnalysis: 200,
    maxTokens: 2000,
  },
};

// Estimate token consumption for a request
export function estimateTokenConsumption(
  endpoint: string,
  resultCount: number = 1
): number {
  const consumption =
    TOKEN_CONSUMPTION[endpoint as keyof typeof TOKEN_CONSUMPTION];
  if (!consumption) return 100; // Default fallback

  let estimated = consumption.base;

  if ("perResult" in consumption) {
    estimated += consumption.perResult * resultCount;
  } else if ("perAnalysis" in consumption) {
    estimated += consumption.perAnalysis * resultCount;
  }

  return Math.min(estimated, consumption.maxTokens);
}

// Check if user has enough tokens
export function hasEnoughTokens(
  userTokens: number,
  requiredTokens: number
): { canProceed: boolean; shortfall?: number } {
  if (userTokens >= requiredTokens) {
    return { canProceed: true };
  }

  return {
    canProceed: false,
    shortfall: requiredTokens - userTokens,
  };
}
