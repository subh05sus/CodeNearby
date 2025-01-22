"use client"

import { useState } from "react"
import TinderCard from "react-tinder-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react"

interface Developer {
  login: string
  avatar_url: string
  html_url: string
  bio: string
  blog: string
  twitter_username: string
}

interface DeveloperCardProps {
  developers: Developer[]
  onSwipe: (direction: string, developerId: string) => void
}

export default function DeveloperCard({ developers, onSwipe }: DeveloperCardProps) {
  const [currentIndex, setCurrentIndex] = useState(developers.length - 1)

  const swiped = (direction: string, idToDelete: string) => {
    console.log("removing: " + idToDelete)
    setCurrentIndex(currentIndex - 1)
    onSwipe(direction, idToDelete)
  }

  return (
    <div className="w-full max-w-sm relative">
      {developers.map((developer) => (
        <TinderCard key={developer.login} onSwipe={(dir) => swiped(dir, developer.login)} preventSwipe={["up", "down"]}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{developer.login}</CardTitle>
              <CardDescription>{developer.bio}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={developer.avatar_url || "/placeholder.svg"}
                alt={developer.login}
                className="w-full h-64 object-cover rounded-md"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              {developer.blog && (
                <Button variant="outline" asChild>
                  <a href={developer.blog} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Blog
                  </a>
                </Button>
              )}
              {developer.twitter_username && (
                <Button variant="outline" asChild>
                  <a
                    href={`https://twitter.com/${developer.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Twitter
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </TinderCard>
      ))}
      <div className="flex justify-center mt-4 space-x-4">
        <Button onClick={() => swiped("left", developers[currentIndex].login)} variant="outline">
          <ThumbsDown className="mr-2 h-4 w-4" /> Pass
        </Button>
        <Button onClick={() => swiped("right", developers[currentIndex].login)}>
          <ThumbsUp className="mr-2 h-4 w-4" /> Connect
        </Button>
      </div>
    </div>
  )
}

