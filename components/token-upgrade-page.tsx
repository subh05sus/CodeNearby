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
import { Switch } from "@/components/ui/switch";
import { Zap, Star, Users, Crown } from "lucide-react";
import { toast } from "sonner";
import { useLocalCurrency } from "@/hooks/use-currency";
import { USER_TIERS, getFormattedTokenPackages } from "@/lib/user-tiers";
import RazorpayPayment from "@/components/razorpay-payment";

export default function TokenUpgradePage() {
  const router = useRouter();
  const { currency, toggleCurrency } = useLocalCurrency();
  const [isLoading] = useState(false);

  const tokenPackages = getFormattedTokenPackages(currency);

  const getIcon = (packageId: string) => {
    switch (packageId) {
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "standard":
        return <Star className="h-6 w-6" />;
      case "pro":
        return <Users className="h-6 w-6" />;
      case "enterprise":
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Token-Based Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pay only for what you use. No subscriptions, no commitments.
            Purchase tokens and consume them as you make API requests.
          </p>

          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm ${
                currency.code === "USD"
                  ? "font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              USD ($)
            </span>
            <Switch
              checked={currency.code === "INR"}
              onCheckedChange={toggleCurrency}
              className="data-[state=checked]:bg-primary"
            />
            <span
              className={`text-sm ${
                currency.code === "INR"
                  ? "font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              INR (₹)
            </span>
          </div>
        </div>

        {/* Token Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {tokenPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                pkg.popular ? "ring-2 ring-primary shadow-2xl" : ""
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getIcon(pkg.id)}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold">{pkg.formattedPrice}</div>
                <CardDescription className="text-sm">
                  {pkg.totalTokens.toLocaleString()} tokens
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {pkg.tokens.toLocaleString()} base tokens
                  {pkg.bonus > 0 && ` + ${pkg.bonus.toLocaleString()} bonus`}
                </p>

                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <RazorpayPayment
                  packageId={pkg.id}
                  currency={currency.code as "USD" | "INR"}
                  amount={
                    currency.code === "USD" ? pkg.price.usd : pkg.price.inr
                  }
                  packageName={pkg.name}
                  tokens={pkg.tokens}
                  bonus={pkg.bonus}
                  onSuccess={() => {
                    toast.success("Tokens purchased successfully!");
                    router.push("/api-dashboard");
                  }}
                  onError={(error) => {
                    toast.error(`Purchase failed: ${error}`);
                  }}
                  disabled={isLoading}
                  className={
                    pkg.popular ? "bg-primary hover:bg-primary/90" : ""
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Tiers Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Account Tiers</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.entries(USER_TIERS).map(([tierKey, tier]) => (
              <Card
                key={tierKey}
                className={
                  tierKey === "premium" ? "ring-2 ring-purple-500" : ""
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        tierKey === "free" ? "bg-gray-500" : "bg-purple-500"
                      }`}
                    />
                    {tierKey.toUpperCase()} TIER
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {(tier as any).dailyTokens.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        daily tokens
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {(tier as any).maxApiKeys}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        API keys maximum
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {(tier as any).features.map(
                        (feature: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                            {feature}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do tokens work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tokens are consumed when you make API requests. Different
                  endpoints may consume different amounts of tokens based on
                  complexity and computational requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do tokens expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No, purchased tokens never expire. You can use them at your
                  own pace without any time pressure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a refund?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We offer refunds for unused tokens within 30 days of purchase.
                  Contact our support team for assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What about free tokens?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All users receive daily free tokens based on their account
                  tier. These reset every 24 hours and are perfect for testing
                  and light usage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
