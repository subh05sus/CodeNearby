"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
interface Developer {
  login: string
  avatar_url: string
  html_url: string
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [developers, setDevelopers] = useState<Developer[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setDevelopers(data)
    } catch (error) {
      console.error("Error searching developers:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Search GitHub Users</h1>
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {developers.map((developer) => (
          <Card key={developer.login}>
            <CardHeader>
              <CardTitle>{developer.login}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image width={64} height={64}
                src={developer.avatar_url || "/placeholder.svg"}
                alt={developer.login}
                className="w-full h-48 object-cover rounded-md"
              />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={developer.html_url} target="_blank" rel="noopener noreferrer">
                  View Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

