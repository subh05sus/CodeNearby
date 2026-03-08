"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  Zap,
  Gift,
  CreditCard,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { getFormattedTokenPackages } from "@/consts/pricing";
import { CurrencyToggle } from "@/components/currency-toggle";
import RazorpayPayment from "@/components/razorpay-payment";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import { cn } from "@/lib/utils";

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
      name: "FREE_TIER",
      description: "BASIC_ACCESS_NODE",
      features: [
        "2,000 DAILY TOKENS",
        "1 API KEY",
        "BASIC ANALYTICS",
        "COMMUNITY SUPPORT",
      ],
      limits: { dailyTokens: 2000, maxApiKeys: 1 },
    },
    {
      id: "premium",
      name: "PREMIUM_TIER",
      description: "ADVANCED_SYSTEM_OPERATOR",
      features: [
        "5,000 DAILY TOKENS",
        "10 API KEYS",
        "ADVANCED ANALYTICS",
        "PRIORITY SUPPORT",
      ],
      limits: { dailyTokens: 5000, maxApiKeys: 10 },
    },
  ];

  function getPackageDescription(packageId: string): string {
    const descriptions = {
      basic: "ENTRY_LEVEL_UPLINK",
      standard: "BALANCED_DATA_STREAM",
      pro: "HIGH_VOLUME_TRANSMISSION",
      enterprise: "UNLIMITED_CORE_OVERLOAD",
    };
    return descriptions[packageId as keyof typeof descriptions] || "";
  }

  return (
    <SwissSection variant="white" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-8 border-swiss-black pb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-swiss-black p-3 text-swiss-white">
                <Coins className="h-10 w-10" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">NEURAL_CURRENCY // V3.0</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.8]">
              TOKEN_STORE
            </h1>
            <p className="mt-8 text-xl font-bold uppercase tracking-tight opacity-40 italic max-w-2xl">
              PURCHASE_AI_TOKENS_TO_POWER_YOUR_API_REQUESTS // NO_SUBSCRIPTIONS // PAY_ONLY_FOR_ACTIVE_DATA_USAGE.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            <p className="text-[10px] font-black uppercase  opacity-40">SYSTEM_LOCALIZATION</p>
            <CurrencyToggle currency={currency} onToggle={toggleCurrency} />
          </div>
        </div>

        {/* Token Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {tokenPackages.map((pkg) => (
            <SwissCard
              key={pkg.id}
              className={cn(
                "p-0 flex flex-col h-full",
                pkg.popular ? "border-8 border-swiss-red shadow-[16px_16px_0_0_rgba(0,0,0,1)]" : "border-8 border-swiss-black"
              )}
            >
              {pkg.popular && (
                <div className="bg-swiss-red text-swiss-white text-center py-2 font-black uppercase text-[10px] tracking-[0.3em]">
                  MOST_FREQUENT_SELECTION
                </div>
              )}

              <div className="p-8 border-b-4 border-swiss-black bg-swiss-muted/10 h-32 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  {pkg.id === "basic" && <Zap className="h-4 w-4 text-swiss-red" />}
                  {pkg.id === "standard" && <TrendingUp className="h-4 w-4 text-swiss-red" />}
                  {pkg.id === "pro" && <Gift className="h-4 w-4 text-swiss-red" />}
                  {pkg.id === "enterprise" && <CreditCard className="h-4 w-4 text-swiss-red" />}
                  <span className="text-[10px] font-black uppercase  opacity-60">PACKAGE_ID: {pkg.id.toUpperCase()}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{pkg.name}</h3>
                <p className="text-[9px] font-bold uppercase  opacity-40 mt-2">{pkg.description}</p>
              </div>

              <div className="p-8 space-y-8 flex-grow">
                <div className="text-center pt-4">
                  <div className="text-5xl font-black tracking-tighter leading-none">{pkg.formattedPrice}</div>
                  <div className="text-[9px] font-black uppercase  opacity-40 mt-2 italic">
                    SINGLE_TRANSACTION_VALUE
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-baseline border-b-2 border-swiss-muted pb-2">
                    <span className="text-[10px] font-black uppercase  opacity-40">BASE_TOKENS</span>
                    <span className="font-black text-lg tracking-tighter">
                      {pkg.tokens.toLocaleString()}
                    </span>
                  </div>

                  {pkg.bonus && (
                    <div className="flex justify-between items-baseline border-b-2 border-swiss-muted pb-2 text-swiss-red">
                      <span className="text-[10px] font-black uppercase  italic">BONUS_CREDIT</span>
                      <span className="font-black text-lg tracking-tighter">
                        +{pkg.bonus.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-4 border-t-4 border-swiss-black">
                    <span className="text-xs font-black uppercase ">TOTAL_PAYLOAD</span>
                    <span className="text-3xl font-black tracking-tighter text-swiss-red">
                      {pkg.totalTokens.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-center opacity-30 italic">
                    APPROX // {currency.symbol}
                    {(pkg.price / pkg.totalTokens).toFixed(4)} PER_UNIT
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0">
                <RazorpayPayment
                  packageId={pkg.id}
                  currency={currency.code as "USD" | "INR"}
                  amount={pkg.price}
                  packageName={pkg.name}
                  tokens={pkg.tokens}
                  bonus={pkg.bonus || 0}
                  onSuccess={() => {
                    toast.success("TOKENS_ACQUIRED", { description: "SUCCESSFUL_WALLET_SYNCHRONIZATION." });
                    router.push("/api-dashboard");
                  }}
                  onError={(error) => {
                    toast.error("TRANSACTION_FAILURE", { description: error });
                  }}
                  disabled={loading === pkg.id}
                  className={cn(
                    "w-full h-16 text-lg font-black uppercase  border-4 transition-all rounded-none",
                    pkg.popular
                      ? "bg-swiss-red border-swiss-black text-swiss-white hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                      : "bg-swiss-black border-swiss-black text-swiss-white hover:bg-swiss-red"
                  )}
                />
              </div>
            </SwissCard>
          ))}
        </div>

        {/* Account Tiers */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12 border-b-4 border-swiss-black pb-4">
            <Package className="h-6 w-6 text-swiss-red" />
            <h2 className="text-4xl font-black uppercase tracking-tighter">SYSTEM_TIERS</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {userTiers.map((tier) => (
              <SwissCard
                key={tier.id}
                className={cn(
                  "p-12",
                  tier.id === "premium" ? "bg-swiss-black text-swiss-white shadow-[16px_16px_0_0_rgba(255,0,0,1)]" : "bg-swiss-white"
                )}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-2">{tier.name}</h3>
                    <p className={cn("text-xs font-black uppercase  opacity-40", tier.id === "premium" && "text-swiss-red opacity-100")}>{tier.description}</p>
                  </div>
                  <div className={cn("p-4 border-4", tier.id === "premium" ? "border-swiss-red" : "border-swiss-black")}>
                    {tier.id === "free" ? <Zap className="h-8 w-8" /> : <TrendingUp className="h-8 w-8 text-swiss-red" />}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-baseline border-b-2 border-swiss-muted/20 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">DAILY_FREE_QUOTA</span>
                    <span className="text-3xl font-black tracking-tighter">{tier.limits.dailyTokens.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-baseline border-b-2 border-swiss-muted/20 pb-4">
                    <span className="text-xs font-black uppercase  opacity-60">CONCURRENT_API_KEYS</span>
                    <span className="text-3xl font-black tracking-tighter">{tier.limits.maxApiKeys}</span>
                  </div>

                  <div className="pt-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-30 italic">MODULE_FEATURES_UNLOCKED</div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                          <CheckCircle className={cn("h-4 w-4 shrink-0", tier.id === "premium" ? "text-swiss-red" : "text-swiss-black")} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SwissCard>
            ))}
          </div>
        </div>

        {/* FAQ Cluster */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-px bg-swiss-black flex-grow" />
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-swiss-red" />
              <h2 className="text-3xl font-black uppercase ">FAQ_PROTOCOL</h2>
            </div>
            <div className="h-px bg-swiss-black flex-grow" />
          </div>

          <div className="grid gap-6">
            {[
              {
                q: "HOW DOES TOKEN-BASED PRICING WORK?",
                a: "INSTEAD OF MONTHLY SUBSCRIPTIONS, YOU PURCHASE TOKENS THAT ARE CONSUMED WHEN MAKING API REQUESTS. EACH API CALL USES A DIFFERENT NUMBER OF TOKENS BASED ON COMPLEXITY. THIS MEANS YOU ONLY PAY FOR WHAT YOU ACTUALLY USE."
              },
              {
                q: "DO TOKENS EXPIRE?",
                a: "PURCHASED TOKENS NEVER EXPIRE. FREE DAILY TOKENS RESET EVERY 24 HOURS. YOUR PURCHASED TOKENS WILL ALWAYS BE AVAILABLE FOR USE."
              },
              {
                q: "WHAT HAPPENS WHEN I RUN OUT OF TOKENS?",
                a: "WHEN YOUR TOKEN BALANCE IS LOW, YOU'LL RECEIVE NOTIFICATIONS TO TOP UP. API REQUESTS WILL FAIL WHEN YOU HAVE INSUFFICIENT TOKENS, BUT YOU CAN PURCHASE MORE AT ANY TIME TO CONTINUE USING THE SERVICE."
              },
              {
                q: "CAN I UPGRADE MY ACCOUNT TIER?",
                a: "ACCOUNT TIERS ARE BASED ON YOUR ACTIVITY AND PURCHASES. VERIFIED TIER IS ACHIEVED THROUGH EMAIL/PHONE VERIFICATION, AND PREMIUM TIER IS UNLOCKED AFTER MAKING YOUR FIRST TOKEN PURCHASE."
              }
            ].map((item, i) => (
              <SwissCard key={i} className="p-8 group hover:bg-swiss-black hover:text-swiss-white transition-all cursor-help relative">
                <div className="absolute top-4 right-4 text-[10px] font-black opacity-10 group-hover:opacity-100 group-hover:text-swiss-red">
                  REF_ID: 0{i + 1}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 group-hover:translate-x-2 transition-transform">{item.q}</h3>
                <p className="font-bold uppercase tracking-tight text-xs leading-relaxed opacity-60 group-hover:opacity-100">{item.a}</p>
              </SwissCard>
            ))}
          </div>

          <div className="mt-24 text-center">
            <div className="inline-block p-1 border-4 border-swiss-black border-dashed opacity-20 hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-black uppercase tracking-[1em] py-2 px-4 italic">END_OF_TRANSMISSION</p>
            </div>
          </div>
        </div>
      </div>
    </SwissSection>
  );
}
