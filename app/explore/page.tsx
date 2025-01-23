"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ExplorePage() {
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [developers, setDevelopers] = useState([])
  const { toast } = useToast()

  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    if (!location) return
    setLoading(true)
    try {
      const response = await fetch(`/api/developers?location=${encodeURIComponent(location)}`)
      const data = await response.json()
      setDevelopers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch developers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            )
            const data = await response.json()
            const locationName = data.address.city || data.address.town || data.address.village || data.address.county
            setLocation(locationName)
            handleLocationSubmit({ preventDefault: () => {} })
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to get your location. Please enter it manually.",
              variant: "destructive",
            })
            setLoading(false)
          }
        },
        () => {
          toast({
            title: "Error",
            description: "Failed to get your location. Please enter it manually.",
            variant: "destructive",
          })
          setLoading(false)
        },
      )
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser. Please enter your location manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Nearby Developers</h1>
      <form onSubmit={handleLocationSubmit} className="flex space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
        <Button type="button" onClick={handleGeolocation} disabled={loading} variant="outline">
          Use My Location
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {developers.map((dev) => (
          <Card key={dev.id}>
            <CardHeader>
              <CardTitle>{dev.login}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={dev.avatar_url || "/placeholder.svg"} alt={dev.login} className="w-20 h-20 rounded-full mb-2" />
              <a
                href={dev.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Profile
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

