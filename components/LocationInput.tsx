"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationInputProps {
  onLocationSubmit: (location: string) => void
}

export default function LocationInput({ onLocationSubmit }: LocationInputProps) {
  const [location, setLocation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLocationSubmit(location)
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            )
            const data = await response.json()
            const locationName = data.display_name.split(",")[0]
            setLocation(locationName)
            onLocationSubmit(locationName)
          } catch (error) {
            console.error("Error fetching location name:", error)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter your location"
      />
      <div className="flex space-x-2">
        <Button type="submit">Search</Button>
        <Button type="button" variant="outline" onClick={handleGetLocation}>
          <MapPin className="mr-2 h-4 w-4" /> Get My Location
        </Button>
      </div>
    </form>
  )
}

