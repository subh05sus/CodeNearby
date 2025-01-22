"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import DeveloperCard from "@/components/DeveloperCard"
import LocationInput from "@/components/LocationInput"


export default function Connect() {
  const { data: session } = useSession()
  const [location, setLocation] = useState("")
  const [developers, setDevelopers] = useState([])

  const handleLocationSubmit = async (submittedLocation: string) => {
    setLocation(submittedLocation)
    try {
      const response = await fetch(`/api/developers?location=${encodeURIComponent(submittedLocation)}`)
      const data = await response.json()
      setDevelopers(data)
    } catch (error) {
      console.error("Error fetching developers:", error)
    }
  }

  const handleSwipe = async (direction: string, developerId: string) => {
    if (!session) return

    try {
      await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          targetId: developerId,
          direction,
        }),
      })
    } catch (error) {
      console.error("Error swiping:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Connect with Developers</h1>
      {!session ? (
        <p className="text-center">Please sign in to connect with developers.</p>
      ) : !location ? (
        <div className="max-w-md mx-auto">
          <LocationInput onLocationSubmit={handleLocationSubmit} />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Developers near {location}</h2>
          <DeveloperCard developers={developers} onSwipe={handleSwipe} />
        </div>
      )}
    </div>
  )
}

