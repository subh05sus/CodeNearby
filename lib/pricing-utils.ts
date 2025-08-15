// Pricing utilities and formatting for CodeNearby API
import {
  TOKEN_PACKAGES,
  USER_TIERS as RAW_USER_TIERS,
  type Currency,
} from "@/consts/pricing";

export interface FormattedTokenPackage {
  id: string;
  name: string;
  description: string;
  tokens: number;
  bonus: number;
  totalTokens: number;
  price: number;
  formattedPrice: string;
  features: string[];
  popular?: boolean;
}

export interface FormattedUserTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  limits: {
    dailyTokens: number;
    maxApiKeys: number | string;
    analytics: boolean;
    repositorySearch: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
}

export function getFormattedTokenPackages(
  currency: Currency
): FormattedTokenPackage[] {
  return TOKEN_PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: getPackageDescription(pkg.id),
    tokens: pkg.tokens,
    bonus: pkg.bonus,
    totalTokens: pkg.tokens + pkg.bonus,
    price: currency.code === "USD" ? pkg.price.usd : pkg.price.inr,
    formattedPrice: `${currency.symbol}${(currency.code === "USD"
      ? pkg.price.usd
      : pkg.price.inr
    ).toLocaleString()}`,
    features: pkg.features,
    popular: pkg.popular,
  }));
}

function getPackageDescription(packageId: string): string {
  const descriptions = {
    basic: "Perfect for small projects and testing",
    standard: "Great for regular API usage",
    pro: "Ideal for high-volume applications",
    enterprise: "Best value for heavy usage",
  };
  return descriptions[packageId as keyof typeof descriptions] || "";
}

export const USER_TIERS: FormattedUserTier[] = (
  Object.entries(RAW_USER_TIERS) as Array<
    [
      keyof typeof RAW_USER_TIERS,
      (typeof RAW_USER_TIERS)[keyof typeof RAW_USER_TIERS]
    ]
  >
).map(([id, t]) => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  price: id === "free" ? "Free" : "Paid",
  description:
    id === "free" ? "Perfect for getting started" : "For serious developers",
  features: t.features,
  limits: {
    dailyTokens: t.dailyTokens,
    maxApiKeys: t.maxApiKeys,
    analytics: t.analytics,
    repositorySearch: t.repositorySearch,
    prioritySupport: t.prioritySupport,
  },
  popular: id === "premium",
}));
