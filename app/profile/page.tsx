/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function Profile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/profile?userId=${session.user.id}`)
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  if (!session) {
    return <p>Please sign in to view your profile.</p>
  }

  if (!profile) {
    return <p>Loading profile...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <img
          src={profile.avatar_url || "/placeholder.svg"}
          alt={profile.login}
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-center mb-2">{profile.name || profile.login}</h2>
        <p className="text-gray-600 text-center mb-4">{profile.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{profile.location || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <p>{profile.company || "Not specified"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Blog</h3>
            <p>
              {profile.blog ? (
                <a
                  href={profile.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {profile.blog}
                </a>
              ) : (
                "Not specified"
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Twitter</h3>
            <p>
              {profile.twitter_username ? (
                <a
                  href={`https://twitter.com/${profile.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{profile.twitter_username}
                </a>
              ) : (
                "Not specified"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

