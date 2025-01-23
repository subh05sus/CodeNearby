"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  useEffect(() => {
    // Check for auth error in URL
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: "There was a problem authenticating with GitHub. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}

