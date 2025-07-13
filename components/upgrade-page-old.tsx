"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Star, Users, Building2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { TOKEN_PACKAGES, USER_TIERS } from "@/lib/pricing-utils";

interface TokenPackage {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: { usd: number; inr: number };
  tokens: number;
  bonusTokens: number;
  description: string;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    icon: <Zap className="h-6 w-6" />,
    price: { usd: 0, inr: 0 },
    period: "forever",
    description: "Perfect for getting started with our API",
    features: [
      "20 API requests per day",
      "1 API key",
      "Basic developer search",
      "Community support",
      "Rate limiting",
    ],
    apiRequests: "20/day",
    apiKeys: "1",
    support: "Community",
  },
  {
    id: "starter",
    name: "Starter",
    icon: <Star className="h-6 w-6" />,
    price: { usd: 9, inr: 749 },
    period: "month",
    description: "Great for small projects and indie developers",
    features: [
      "500 API requests per day",
      "3 API keys",
      "Advanced search filters",
      "Email support",
      "Usage analytics",
      "Higher rate limits",
    ],
    apiRequests: "500/day",
    apiKeys: "3",
    support: "Email",
    popular: true,
  },
  {
    id: "developer",
    name: "Developer",
    icon: <Users className="h-6 w-6" />,
    price: { usd: 29, inr: 2399 },
    period: "month",
    description: "Perfect for growing teams and applications",
    features: [
      "2,000 API requests per day",
      "10 API keys",
      "Priority support",
      "Advanced analytics",
      "Webhook support",
      "Custom integrations",
      "Team management",
    ],
    apiRequests: "2,000/day",
    apiKeys: "10",
    support: "Priority",
  },
  {
    id: "business",
    name: "Business",
    icon: <Building2 className="h-6 w-6" />,
    price: { usd: 99, inr: 8199 },
    period: "month",
    description: "For established businesses with high volume needs",
    features: [
      "10,000 API requests per day",
      "50 API keys",
      "Dedicated support",
      "Custom rate limits",
      "SLA guarantee",
      "Advanced security",
      "White-label options",
      "Custom integrations",
    ],
    apiRequests: "10,000/day",
    apiKeys: "50",
    support: "Dedicated",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <Crown className="h-6 w-6" />,
    price: { usd: 0, inr: 0 },
    period: "custom",
    description: "Tailored solutions for large organizations",
    features: [
      "Unlimited API requests",
      "Unlimited API keys",
      "24/7 phone support",
      "Custom deployment",
      "Dedicated infrastructure",
      "Custom contracts",
      "On-premise options",
      "Advanced security & compliance",
    ],
    apiRequests: "Unlimited",
    apiKeys: "Unlimited",
    support: "24/7 Phone",
    enterprise: true,
  },
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency } = useCurrency();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (tierId: string) => {
    if (!session) {
      toast.error("Please sign in to upgrade your plan");
      router.push("/auth/signin");
      return;
    }

    setLoadingTier(tierId);

    try {
      if (tierId === "enterprise") {
        // Redirect to contact form
        window.open(
          "mailto:contact@codenearby.com?subject=Enterprise Plan Inquiry",
          "_blank"
        );
        return;
      }

      // Create checkout session
      const response = await fetch("/api/v1/billing/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId,
          currency,
          yearly: isYearly,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to start upgrade process. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  const getPrice = (tier: PricingTier) => {
    if (tier.enterprise) return "Contact Sales";
    if (tier.price.usd === 0) return "Free";

    const price = currency.code === "INR" ? tier.price.inr : tier.price.usd;
    const yearlyPrice = Math.round(price * 12 * 0.8); // 20% discount for yearly
    const displayPrice = isYearly ? yearlyPrice : price;

    return `${currency.symbol}${displayPrice.toLocaleString()}`;
  };

  const getPeriod = (tier: PricingTier) => {
    if (tier.enterprise) return "";
    if (tier.price.usd === 0) return "";
    return isYearly ? "/year" : "/month";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Upgrade your CodeNearby API access with the perfect plan for your
          needs
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span
            className={`text-sm ${
              !isYearly ? "font-medium" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={`text-sm ${
              isYearly ? "font-medium" : "text-muted-foreground"
            }`}
          >
            Yearly
          </span>
          {isYearly && (
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative ${
              tier.popular ? "border-primary shadow-lg scale-105" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    tier.popular
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {tier.icon}
                </div>
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                {getPrice(tier)}
                <span className="text-sm font-normal text-muted-foreground">
                  {getPeriod(tier)}
                </span>
              </div>
              <CardDescription className="text-sm">
                {tier.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Stats */}
              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span>API Requests:</span>
                  <span className="font-medium">{tier.apiRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>API Keys:</span>
                  <span className="font-medium">{tier.apiKeys}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Support:</span>
                  <span className="font-medium">{tier.support}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className="w-full mt-6"
                variant={tier.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(tier.id)}
                disabled={loadingTier === tier.id}
              >
                {loadingTier === tier.id
                  ? "Processing..."
                  : tier.enterprise
                  ? "Contact Sales"
                  : tier.price.usd === 0
                  ? "Current Plan"
                  : "Upgrade Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-muted/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              What happens to unused requests?
            </h3>
            <p className="text-sm text-muted-foreground">
              API requests reset daily and don&apos;t roll over. Upgrade for
              higher daily limits.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for all paid plans. Contact
              support for assistance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How does billing work?</h3>
            <p className="text-sm text-muted-foreground">
              Billing is automatic and recurring. You&apos;ll receive an invoice
              before each billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
