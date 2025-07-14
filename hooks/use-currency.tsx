"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Currency, getCurrency } from "@/lib/user-tiers";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  setCurrency: (code: "USD" | "INR") => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(getCurrency("USD"));

  // Load saved currency preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("codenearby-currency");
    if (saved === "USD" || saved === "INR") {
      setCurrencyState(getCurrency(saved));
    }
  }, []);

  const setCurrency = (code: "USD" | "INR") => {
    const newCurrency = getCurrency(code);
    setCurrencyState(newCurrency);
    localStorage.setItem("codenearby-currency", code);
  };

  const toggleCurrency = () => {
    const newCode = currency.code === "USD" ? "INR" : "USD";
    setCurrency(newCode);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Standalone hook for components that don't need the provider
export function useLocalCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(getCurrency("USD"));

  useEffect(() => {
    const saved = localStorage.getItem("codenearby-currency");
    if (saved === "USD" || saved === "INR") {
      setCurrencyState(getCurrency(saved));
    }
  }, []);

  const setCurrency = (code: "USD" | "INR") => {
    const newCurrency = getCurrency(code);
    setCurrencyState(newCurrency);
    localStorage.setItem("codenearby-currency", code);
  };

  const toggleCurrency = () => {
    const newCode = currency.code === "USD" ? "INR" : "USD";
    setCurrency(newCode);
  };

  return { currency, toggleCurrency, setCurrency };
}
