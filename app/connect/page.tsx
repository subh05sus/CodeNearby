/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import TinderCard from "react-tinder-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Heart, MapPin, GitBranch, Users, SkipForward } from "lucide-react"
import type { Developer, UserProfile } from "@/types"
import type { Session } from "next-auth"
import { fetchGitHubData } from "@/lib/github"

interface ExtendedDeveloper extends Developer {
  distance?: string
  details?: any
}

export default function ConnectPage() {
  const { data: session } = useSession() as { data: Session | null }
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [developers, setDevelopers] = useState<ExtendedDeveloper[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fetchedProfiles, setFetchedProfiles] = useState(0)
  const { toast } = useToast()
  const topCardRef = useRef<any>(null)

  useEffect(() => {
    if (session) {
      fetchUserProfile()
    }
  }, [session])

  useEffect(() => {
    const fetchTopDeveloperDetails = async () => {
      if (developers.length > 0 && !developers[developers.length - 1].details) {
        const topDev = developers[developers.length - 1]
        try {
          const details = await fetchGitHubData(topDev.login)
          setDevelopers((prevDevs) =>
            prevDevs.map((dev, index) => (index === prevDevs.length - 1 ? { ...dev, details } : dev)),
          )
        } catch (error) {
          console.error("Failed to fetch developer details:", error)
        }
      }
    }

    fetchTopDeveloperDetails()
  }, [developers])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      setUserProfile(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch user profile.",
        variant: "destructive",
      })
    }
  }

  const calculateDistance = async (devLocation: string) => {
    console.log("Calculating distance...")
    if (!location || !devLocation) return null

    try {
      // Get coordinates for input location
      const locResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      )
      const locData = await locResponse.json()
      if (!locData[0]) return null

      // Get coordinates for developer location
      const devResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(devLocation)}`,
      )
      const devData = await devResponse.json()
      if (!devData[0]) return null

      // Calculate distance using Haversine formula
      const R = 6371 // Earth's radius in km
      const lat1 = Number.parseFloat(locData[0].lat)
      const lon1 = Number.parseFloat(locData[0].lon)
      const lat2 = Number.parseFloat(devData[0].lat)
      const lon2 = Number.parseFloat(devData[0].lon)

      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c
      console.log("Distance calculated:", distance)
      return `${Math.round(distance)} km away`
    } catch (error) {
      console.error("Error calculating distance:", error)
      return null
    }
  }

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) return
    setLoading(true)
    try {
      const response = await fetch(`/api/developers?location=${encodeURIComponent(location)}`)
      const data = await response.json()

      // Get declined profiles from DB
      const declinedResponse = await fetch("/api/declined-profiles")
      const declinedData = await declinedResponse.json()
      const declinedIds = new Set(declinedData.map((profile: any) => profile.githubId))

      // Filter developers
      const filteredDevelopers = await Promise.all(
        data
          .filter(
            (dev: Developer) =>
              dev.id !== session?.user?.id && // Not self
              !userProfile?.friends.some((friend) => friend.githubId.toString() === dev.id) && // Not friends
              !userProfile?.sentRequests.includes(dev.id) && // Not sent requests
              !declinedIds.has(dev.id), // Not declined
          )
          .map(async (dev: Developer) => {
            const distance = dev.location ? await calculateDistance(dev.location) : null
            return { ...dev, distance }
          }),
      )

      setDevelopers(filteredDevelopers.reverse())
      setFetchedProfiles(filteredDevelopers.length)
    } catch {
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
            handleLocationSubmit({ preventDefault: () => {} } as React.FormEvent)
          } catch {
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
    }
  }

  const onSwipe = async (direction: string, developer: Developer) => {
    if (!session) return

    if (direction === "right") {
      try {
        const response = await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(developer),
        })

        if (!response.ok) throw new Error("Failed to send friend request")

        toast({
          title: "Success",
          description: "Friend request sent!",
        })
      } catch {
        toast({
          title: "Error",
          description: "Failed to send friend request.",
          variant: "destructive",
        })
      }
    } else if (direction === "left") {
      // Store declined profile
      try {
        await fetch("/api/declined-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubId: developer.id }),
        })
      } catch (error) {
        console.error("Error storing declined profile:", error)
      }
    }

    setDevelopers((prev) => prev.filter((dev) => dev.id !== developer.id))
  }

  const handleChangeLocation = () => {
    setFetchedProfiles(0)
    setDevelopers([])
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to connect with developers.</p>
      </div>
    )
  }

  if (fetchedProfiles === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Find Developers Nearby</h1>
        <form onSubmit={handleLocationSubmit} className="w-full space-y-4">
          <Input
            type="text"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Search
            </Button>
            <Button type="button" onClick={handleGeolocation} variant="outline" disabled={loading}>
              <MapPin className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center max-w-md mx-auto min-h-[50vh]">
      <div className="w-full text-center mb-6 flex items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 inline mr-1" />
          {location}
        </p>
        <Button variant="ghost" size="sm" onClick={handleChangeLocation}>
          Change
        </Button>
      </div>

      <div className="relative w-full h-[60vh]">
        {developers.map((developer, index) => {
          const isTopCard = index === 0
          return (
            <TinderCard
              key={developer.id}
              ref={isTopCard ? topCardRef : null}
              onSwipe={(dir) => onSwipe(dir, developer)}
              preventSwipe={["up", "down"]}
              className="absolute w-full h-full select-none"
            >
              <div className="relative w-full h-full bg-card rounded-xl border dark:border-white/20 border-black/20 overflow-hidden">
                <div className="relative w-full h-1/2">
                  <Image
                    src={developer.avatar_url || "/placeholder.svg"}
                    alt={developer.login}
                    layout="fill"
                    objectFit="cover"
                    sizes="(min-width: 640px) 640px, 100vw"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{developer.login}</h3>
                      {developer.name && <p className="text-sm text-muted-foreground mt-1">{developer.name}</p>}
                    </div>
                    {developer.distance && <span className="text-sm text-muted-foreground">{developer.distance}</span>}
                  </div>
                  {developer.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="inline-block w-4 h-4 mr-1" />
                      {developer.location}
                    </p>
                  )}
                  {developer.details?.public_repos && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <GitBranch className="inline-block w-4 h-4 mr-1" />
                      {developer.details.public_repos} public repos
                    </p>
                  )}
                  {developer.details?.followers && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <Users className="inline-block w-4 h-4 mr-1" />
                      {developer.details.followers} followers
                    </p>
                  )}
                  {developer.details?.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{developer.details.bio}</p>
                  )}
                </div>
              </div>
            </TinderCard>
          )
        })}
      </div>

      <div className="flex justify-center gap-4 mt-16">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full p-6"
          onClick={() => developers.length > 0 && onSwipe("left", developers[developers.length - 1])}
        >
          <X className="h-6 w-6 text-destructive" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full p-6"
          onClick={() => developers.length > 0 && setDevelopers((prev) => prev.slice(0, -1))}
        >
          <SkipForward className="h-6 w-6" />
        </Button>
        <Button
          size="lg"
          className="rounded-full p-6"
          onClick={() => developers.length > 0 && onSwipe("right", developers[developers.length - 1])}
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

