"use client";

import { useState, useEffect } from "react";
import { CurrencyInfo, detectClientCurrency } from "@/lib/pricing-utils";

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: "USD",
    symbol: "$",
    locale: "en-US",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect currency on client side
    const detectedCurrency = detectClientCurrency();
    setCurrency(detectedCurrency);
    setIsLoading(false);
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) =>
      prev.code === "USD"
        ? { code: "INR", symbol: "₹", locale: "hi-IN" }
        : { code: "USD", symbol: "$", locale: "en-US" }
    );
  };

  return {
    currency,
    setCurrency,
    toggleCurrency,
    isLoading,
  };
}
