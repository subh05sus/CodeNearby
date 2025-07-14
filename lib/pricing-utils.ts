// Pricing utilities and formatting for CodeNearby API
import { Currency, TOKEN_PACKAGES } from "@/lib/user-tiers";

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

export function getFormattedTokenPackages(currency: Currency): FormattedTokenPackage[] {
  return TOKEN_PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: getPackageDescription(pkg.id),
    tokens: pkg.tokens,
    bonus: pkg.bonus,
    totalTokens: pkg.tokens + pkg.bonus,
    price: pkg.price[currency.code.toLowerCase() as keyof typeof pkg.price],
    formattedPrice: `${currency.symbol}${pkg.price[currency.code.toLowerCase() as keyof typeof pkg.price].toLocaleString()}`,
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

export const USER_TIERS: FormattedUserTier[] = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "1,000 daily tokens",
      "1 API key",
      "Basic analytics",
      "Community support",
    ],
    limits: {
      dailyTokens: 1000,
      maxApiKeys: 1,
      analytics: true,
      repositorySearch: true,
      prioritySupport: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99/month",
    description: "For serious developers",
    features: [
      "2,000 daily tokens",
      "10 API keys",
      "Advanced analytics",
      "Priority support",
      "Early access to features",
    ],
    limits: {
      dailyTokens: 2000,
      maxApiKeys: 10,
      analytics: true,
      repositorySearch: true,
      prioritySupport: true,
    },
    popular: true,
  },
];
