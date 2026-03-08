"use client";

import { Currency } from "@/consts/pricing";
import { cn } from "@/lib/utils";

interface CurrencyToggleProps {
  currency: Currency;
  onToggle: () => void;
}

export function CurrencyToggle({ currency, onToggle }: CurrencyToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="flex items-center gap-0 border-4 border-black dark:border-white bg-white dark:bg-black overflow-hidden shadow-[6px_6px_0_0_rgba(255,0,0,1)]"
        onClick={onToggle}
      >
        <button
          className={cn(
            "px-6 py-2 text-sm font-black uppercase  transition-colors",
            currency.code === "USD" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-black text-black dark:text-white hover:bg-muted dark:hover:bg-neutral-900"
          )}
        >
          USD [$]
        </button>
        <div className="w-1 h-10 bg-black dark:bg-white" />
        <button
          className={cn(
            "px-6 py-2 text-sm font-black uppercase  transition-colors",
            currency.code === "INR" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-black text-black dark:text-white hover:bg-muted dark:hover:bg-neutral-900"
          )}
        >
          INR [₹]
        </button>
      </div>
    </div>
  );
}
