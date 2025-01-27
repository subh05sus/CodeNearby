/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Developer } from "@/types"
import Image from "next/image"

export default function SearchPage() {
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [developers, setDevelopers] = useState([])
  const { toast } = useToast()

  const handleSearch = async (e:any) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setDevelopers(data)
    } catch  {
      toast({
        title: "Error",
        description: "Failed to search developers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (developer:Developer) => {
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
    } catch  {
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Search Developers</h1>
      <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Enter username or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {developers.map((dev:Developer) => (
          <Card key={dev.id}>
            <CardHeader>
              <CardTitle>{dev.login}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={dev.avatar_url || "/placeholder.svg"} alt={dev.login} className="w-20 h-20 rounded-full mb-2" 
              height={80} width={80}
              />
              <p className="text-sm text-muted-foreground mb-2">Name: {dev.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-2">Location: {dev.location || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-2">Public Repos: {dev.public_repos || "N/A"}</p>
              <div className="flex space-x-2 mt-4">
                <Link href={dev.html_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
                {session && (
                  <Button variant="outline" size="sm" onClick={() => sendFriendRequest(dev)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

