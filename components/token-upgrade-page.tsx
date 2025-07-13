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
import { Check, Zap, Star, Users, Crown } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { TOKEN_PACKAGES, type TokenPackage } from "@/lib/pricing-utils";

export default function TokenUpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseTokens = async (packageData: TokenPackage) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/billing/buy-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageData.id,
          currency: currency.code.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase tokens");
      }

      // Redirect to payment URL or handle success
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success("Tokens purchased successfully!");
        router.refresh();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setIsLoading(false);
    }
  };

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
          {TOKEN_PACKAGES.map((pkg) => (
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
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {getIcon(pkg.id)}
                  </div>
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {currency.code === "USD" ? "$" : "₹"}
                  {currency.code === "USD" ? pkg.price.usd : pkg.price.inr}
                </div>
                <CardDescription className="text-sm">
                  {pkg.tokens.toLocaleString()} tokens
                  {pkg.bonus && pkg.bonus > 0 && (
                    <span className="text-primary font-medium">
                      {" "}
                      + {pkg.bonus.toLocaleString()} bonus
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {pkg.description}
                </p>

                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchaseTokens(pkg)}
                  disabled={isLoading}
                  className={`w-full ${
                    pkg.popular ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isLoading ? "Processing..." : "Purchase Tokens"}
                </Button>
              </CardContent>
            </Card>
          ))}
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
