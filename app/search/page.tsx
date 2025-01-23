"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [developers, setDevelopers] = useState([])
  const { toast } = useToast()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setDevelopers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search developers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

