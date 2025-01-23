/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Messaging() {
  const { data: session } = useSession()
  const [friends, setFriends] = useState([])

  useEffect(() => {
    if (session) {
      fetchFriends()
    }
  }, [session])

  const fetchFriends = async () => {
    if (!session?.user?.id) return
    try {
      const response = await fetch(`/api/friends?userId=${session.user.id}`)
      const data = await response.json()
      setFriends(data)
    } catch (error) {
      console.error("Error fetching friends:", error)
    }
  }

  if (!session) {
    return <p>Please sign in to view your messages.</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Messages</h1>
      <ul className="space-y-2">
        {friends.map((friend: any) => (
          <li key={friend.id} className="bg-white shadow-md rounded-lg p-4">
            <Link href={`/messaging/${friend.id}`} className="flex items-center">
              <Image width={64} height={64}
                src={friend.avatar_url || "/placeholder.svg"}
                alt={friend.login}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="font-semibold">{friend.name || friend.login}</h2>
                <p className="text-gray-600 text-sm">Click to view conversation</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

