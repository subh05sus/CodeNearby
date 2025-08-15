// Centralized pricing, tiers, and token-usage estimates

export type CurrencyCode = "USD" | "INR";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$" },
  { code: "INR", symbol: "₹" },
];

export type UserTierId = "free" | "premium";

export interface TierConfig {
  dailyTokens: number;
  maxApiKeys: number;
  features: string[];
  support: string;
  analytics: boolean;
  repositorySearch: boolean;
  prioritySupport: boolean;
}

export const USER_TIERS: Record<UserTierId, TierConfig> = {
  free: {
    dailyTokens: 2000,
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
    dailyTokens: 5000,
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

export function getTokenPackage(packageId: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find((p) => p.id === packageId);
}

// Token cost estimates per endpoint
export const API_TOKEN_COSTS: Record<
  string,
  { min: number; max: number; average: number }
> = {
  "/api/v1/developers": { min: 200, max: 800, average: 400 },
  "/api/v1/profile": { min: 300, max: 2000, average: 1000 },
  "/api/v1/profile/analyze": { min: 200, max: 500, average: 300 },
  "/api/v1/repositories": { min: 150, max: 1200, average: 600 },
  "/api/v1/users/tier": { min: 0, max: 0, average: 0 },
};

export function getEstimatedTokenCost(endpoint: string): {
  min: number;
  max: number;
  average: number;
} {
  return API_TOKEN_COSTS[endpoint] || { min: 100, max: 500, average: 300 };
}

export function getFormattedTokenPackages(currency: Currency) {
  return TOKEN_PACKAGES.map((pkg) => ({
    ...pkg,
    formattedPrice:
      currency.code === "USD" ? `$${pkg.price.usd}` : `₹${pkg.price.inr}`,
    totalTokens: pkg.tokens + pkg.bonus,
  }));
}
