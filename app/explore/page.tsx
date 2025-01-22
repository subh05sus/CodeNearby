/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import DeveloperList from "@/components/DeveloperList"
import LocationSearch from "@/components/LocationSearch"


export default function Home() {
  const [developers, setDevelopers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (location: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/github-users?location=${encodeURIComponent(location)}`)
      if (!response.ok) throw new Error("Failed to fetch developers")
      const data = await response.json()
      setDevelopers(data)
    } catch (error:any) {
      toast({
        title: "Error",
        description: "Failed to fetch developers. Please try again."+ error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub Developer Search by Location</h1>
      <LocationSearch onSearch={handleSearch} />
      <DeveloperList developers={developers} isLoading={isLoading} />
    </main>
  )
}

