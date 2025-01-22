/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface LocationSearchProps {
  onSearch: (location: string) => void
}

export default function LocationSearch({ onSearch }: LocationSearchProps) {
  const [location, setLocation] = useState("")
  const { toast } = useToast()

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      onSearch(location.trim())
    }
  }

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            )
            const data = await response.json()
            const locationName = data.address.city || data.address.town || data.address.village || data.address.county
            if (locationName) {
              setLocation(locationName)
              onSearch(locationName)
            } else {
              toast({
                title: "Location not found",
                description: "Could not determine your location. Please enter it manually.",
                variant: "destructive",
              })
            }
          } catch (error:any) {
            toast({
              title: "Error",
              description: "Failed to get location. Please try again or enter manually."+ error.message,
              variant: "destructive",
            })
          }
        },
        () => {
          toast({
            title: "Geolocation denied",
            description: "Please enable geolocation or enter your location manually.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation. Please enter your location manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleManualSearch} className="flex gap-2 mb-4">
      <Input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Search</Button>
      <Button type="button" onClick={handleGeolocation} variant="outline">
        Use My Location
      </Button>
    </form>
  )
}

