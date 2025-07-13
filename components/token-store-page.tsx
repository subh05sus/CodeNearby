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
import { getFormattedTokenPackages, USER_TIERS } from "@/lib/pricing-utils";
import { CurrencyToggle } from "@/components/currency-toggle";

export default function TokenStorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const [loading, setLoading] = useState<string | null>(null);

  const tokenPackages = getFormattedTokenPackages(currency);

  const handlePurchase = async (packageId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to purchase tokens");
      router.push("/auth/signin");
      return;
    }

    setLoading(packageId);
    try {
      const response = await fetch("/api/v1/billing/buy-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          currency: currency.code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Redirecting to checkout...");
        // In a real app, redirect to the payment processor
        console.log("Checkout URL:", data.url);
        window.open(data.url, "_blank");
      } else {
        toast.error(data.error || "Failed to create checkout");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  };

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
                  {currency.symbol}
                  {pkg.pricePerToken.toFixed(4)} per token
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                {loading === pkg.id ? "Processing..." : "Purchase Tokens"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Tiers */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Account Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {USER_TIERS.map((tier) => (
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
                    <span className="font-medium">{tier.dailyFreeTokens}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Max API keys:</span>
                    <span className="font-medium">{tier.maxApiKeys}</span>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm font-medium mb-2">Features:</div>
                    <ul className="text-sm space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
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
