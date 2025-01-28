/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface Friend {
  id: string
  name: string
  githubUsername: string
  image: string
  githubId: number
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [friends, setFriends] = useState<Friend[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetchFriends()
    }
  }, [session])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends")
      const data = await response.json()
      setFriends(data)
    } catch  {
      toast({
        title: "Error",
        description: "Failed to fetch friends.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view your messages.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.map((friend) => (
          <Link key={friend.id} href={`/messages/${friend.githubId}`}>
            <Card className="hover:bg-gray-100 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Image
                  height={40}
                    width={40}
                    src={friend.image || "/placeholder.svg"}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p>{friend.name}</p>
                    <p className="text-sm text-muted-foreground">@{friend.githubUsername}</p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

