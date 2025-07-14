"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Coins,
  Zap,
  Gift,
  CreditCard,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { getFormattedTokenPackages } from "@/lib/user-tiers";
import { CurrencyToggle } from "@/components/currency-toggle";
import RazorpayPayment from "@/components/razorpay-payment";

export default function TokenStorePage() {
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const [loading] = useState<string | null>(null);

  const tokenPackages = getFormattedTokenPackages(currency).map((pkg) => ({
    ...pkg,
    description: getPackageDescription(pkg.id),
    price: currency.code === "USD" ? pkg.price.usd : pkg.price.inr,
  }));

  const userTiers = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      features: [
        "1,000 daily tokens",
        "1 API key",
        "Basic analytics",
        "Community support",
      ],
      limits: { dailyTokens: 1000, maxApiKeys: 1 },
    },
    {
      id: "premium",
      name: "Premium",
      description: "For serious developers",
      features: [
        "2,000 daily tokens",
        "10 API keys",
        "Advanced analytics",
        "Priority support",
      ],
      limits: { dailyTokens: 2000, maxApiKeys: 10 },
    },
  ];

  function getPackageDescription(packageId: string): string {
    const descriptions = {
      basic: "Perfect for small projects and testing",
      standard: "Great for regular API usage",
      pro: "Ideal for high-volume applications",
      enterprise: "Best value for heavy usage",
    };
    return descriptions[packageId as keyof typeof descriptions] || "";
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Coins className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Token Store</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Purchase AI tokens to power your API requests. No subscriptions, pay
          only for what you use.
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <CurrencyToggle currency={currency} onToggle={toggleCurrency} />
        </div>
      </div>

      {/* Token Packages */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {tokenPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative ${
              pkg.popular ? "ring-2 ring-blue-500 scale-105" : ""
            }`}
          >
            {pkg.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {pkg.id === "basic" && <Zap className="h-5 w-5" />}
                {pkg.id === "standard" && <TrendingUp className="h-5 w-5" />}
                {pkg.id === "pro" && <Gift className="h-5 w-5" />}
                {pkg.id === "enterprise" && <CreditCard className="h-5 w-5" />}
                {pkg.name}
              </CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="text-center">
                <div className="text-3xl font-bold">{pkg.formattedPrice}</div>
                <div className="text-sm text-muted-foreground">
                  One-time purchase
                </div>
              </div>

              {/* Token Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base tokens:</span>
                  <span className="font-medium">
                    {pkg.tokens.toLocaleString()}
                  </span>
                </div>

                {pkg.bonus && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Bonus tokens:</span>
                    <span className="font-medium">
                      +{pkg.bonus.toLocaleString()}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Total tokens:</span>
                  <span className="text-blue-600">
                    {pkg.totalTokens.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  ~{currency.symbol}
                  {(pkg.price / pkg.totalTokens).toFixed(4)} per token
                </div>
              </div>

              {/* Purchase Button */}
              <RazorpayPayment
                packageId={pkg.id}
                currency={currency.code as "USD" | "INR"}
                amount={pkg.price}
                packageName={pkg.name}
                tokens={pkg.tokens}
                bonus={pkg.bonus || 0}
                onSuccess={() => {
                  toast.success("Tokens purchased successfully!");
                  router.push("/api-dashboard");
                }}
                onError={(error) => {
                  toast.error(`Purchase failed: ${error}`);
                }}
                disabled={loading === pkg.id}
                className={pkg.popular ? "bg-blue-600 hover:bg-blue-700" : ""}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Tiers */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Account Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {userTiers.map((tier) => (
            <Card
              key={tier.id}
              className={tier.id === "premium" ? "ring-2 ring-purple-500" : ""}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tier.id === "free" && <Zap className="h-5 w-5" />}
                  {tier.id === "verified" && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {tier.id === "premium" && <Gift className="h-5 w-5" />}
                  {tier.name}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Daily free tokens:</span>
                    <span className="font-medium">
                      {tier.limits.dailyTokens}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Max API keys:</span>
                    <span className="font-medium">
                      {tier.limits.maxApiKeys}
                    </span>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-medium mb-2">Features:</div>
                    <ul className="text-sm space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                How does token-based pricing work?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Instead of monthly subscriptions, you purchase tokens that are
                consumed when making API requests. Each API call uses a
                different number of tokens based on complexity. This means you
                only pay for what you actually use.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do tokens expire?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Purchased tokens never expire. Free daily tokens reset every 24
                hours. Your purchased tokens will always be available for use.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                What happens when I run out of tokens?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                When your token balance is low, you&apos;ll receive
                notifications to top up. API requests will fail when you have
                insufficient tokens, but you can purchase more at any time to
                continue using the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Can I upgrade my account tier?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Account tiers are based on your activity and purchases. Verified
                tier is achieved through email/phone verification, and Premium
                tier is unlocked after making your first token purchase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
