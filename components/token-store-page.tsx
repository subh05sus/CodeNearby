"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Zap, Gift, CreditCard, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { getFormattedTokenPackages } from "@/consts/pricing";
import { CurrencyToggle } from "@/components/currency-toggle";
import RazorpayPayment from "@/components/razorpay-payment";
import { motion } from "framer-motion";

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
      color: "hsl(24 95% 53%)",
      description: "Perfect for getting started",
      features: ["2,000 daily tokens", "1 API key", "Basic analytics", "Community support"],
      limits: { dailyTokens: 2000, maxApiKeys: 1 },
    },
    {
      id: "premium",
      name: "Premium",
      color: "hsl(270 70% 60%)",
      description: "For serious developers",
      features: ["5,000 daily tokens", "10 API keys", "Advanced analytics", "Priority support"],
      limits: { dailyTokens: 5000, maxApiKeys: 10 },
    },
  ];

  const faqItems = [
    {
      q: "How does token-based pricing work?",
      a: "Instead of monthly subscriptions, you purchase tokens that are consumed when making API requests. Each API call uses a different number of tokens based on complexity. This means you only pay for what you actually use.",
    },
    {
      q: "Do tokens expire?",
      a: "Purchased tokens never expire. Free daily tokens reset every 24 hours. Your purchased tokens will always be available for use.",
    },
    {
      q: "What happens when I run out of tokens?",
      a: "When your token balance is low, you'll receive notifications to top up. API requests will fail when you have insufficient tokens, but you can purchase more at any time to continue using the service.",
    },
    {
      q: "Can I upgrade my account tier?",
      a: "Account tiers are based on your activity and purchases. Verified tier is achieved through email/phone verification, and Premium tier is unlocked after making your first token purchase.",
    },
  ];

  function getPackageDescription(packageId: string): string {
    const descriptions: Record<string, string> = {
      basic: "Perfect for small projects and testing",
      standard: "Great for regular API usage",
      pro: "Ideal for high-volume applications",
      enterprise: "Best value for heavy usage",
    };
    return descriptions[packageId] || "";
  }

  const pkgIcons: Record<string, React.ReactNode> = {
    basic: <Zap className="h-5 w-5" />,
    standard: <TrendingUp className="h-5 w-5" />,
    pro: <Gift className="h-5 w-5" />,
    enterprise: <CreditCard className="h-5 w-5" />,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "hsl(24 95% 53% / 0.12)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Coins className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl mb-2">Token Store</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm mb-6">
          Purchase AI tokens to power your API requests. No subscriptions — pay only for what you use.
        </p>
        <div className="flex items-center justify-center">
          <CurrencyToggle currency={currency} onToggle={toggleCurrency} />
        </div>
      </motion.div>

      {/* Token Packages */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {tokenPackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`relative rounded-2xl border bg-card p-5 flex flex-col gap-4 ${
              pkg.popular
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/30 transition-colors"
            }`}
          >
            {pkg.popular && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-0.5 rounded-full text-white whitespace-nowrap"
                style={{ background: "hsl(24 95% 53%)" }}
              >
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(24 95% 53% / 0.12)" }}
              >
                <span className="text-primary">{pkgIcons[pkg.id]}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{pkg.name}</h3>
                <p className="text-[11px] text-muted-foreground">{pkg.description}</p>
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold font-mono">{pkg.formattedPrice}</div>
              <p className="text-xs text-muted-foreground">One-time purchase</p>
            </div>

            <div className="space-y-1.5 text-sm flex-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base tokens</span>
                <span className="font-mono font-semibold">{pkg.tokens.toLocaleString()}</span>
              </div>
              {pkg.bonus && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Bonus tokens</span>
                  <span className="font-mono font-semibold">+{pkg.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>Total tokens</span>
                <span className="font-mono" style={{ color: "hsl(24 95% 53%)" }}>
                  {pkg.totalTokens.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                ~{currency.symbol}{(pkg.price / pkg.totalTokens).toFixed(4)} per token
              </p>
            </div>

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
              className={pkg.popular ? "text-white" : ""}
            />
          </motion.div>
        ))}
      </div>

      {/* Account Tiers */}
      <div className="mb-14">
        <h2 className="font-heading text-2xl text-center mb-6">Account Tiers</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {userTiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl border border-border bg-card p-5"
              style={{ borderColor: `${tier.color}30` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${tier.color}18` }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: tier.color }} />
                </div>
                <h3 className="font-semibold">{tier.name}</h3>
                <span
                  className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: tier.color }}
                >
                  {tier.name.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <div className="font-bold font-mono">{tier.limits.dailyTokens.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">daily tokens</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <div className="font-bold font-mono">{tier.limits.maxApiKeys}</div>
                  <div className="text-[11px] text-muted-foreground">API keys</div>
                </div>
              </div>

              <ul className="space-y-1.5">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: tier.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
