"use client"

import { SessionProvider } from "next-auth/react"
import { CurrencyProvider } from "@/hooks/use-currency"

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </SessionProvider>
  )
}

