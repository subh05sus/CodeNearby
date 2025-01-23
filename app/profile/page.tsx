/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Users, GitBranch, Star } from "lucide-react"
import type { UserProfile } from "@/types"
import { fetchGitHubData } from "@/lib/github"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetchProfile()
      fetchGitHubStats()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      setProfile(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGitHubStats = async () => {
    if (!session?.user?.login) return
    try {
      const data = await fetchGitHubData(session.user.login)
      setStats(data)
    } catch  {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub stats.",
        variant: "destructive",
      })
    }
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view your profile.</p>
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
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <img
            src={session.user.image || "/placeholder.svg"}
            alt={session.user.name || "Profile"}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">{session.user.name}</h1>
            <p className="text-muted-foreground">@{session.user.login}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </div>
            <span className="text-2xl font-bold">{profile?.friends?.length || 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Repositories</span>
            </div>
            <span className="text-2xl font-bold">{stats?.public_repos || 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Followers</span>
            </div>
            <span className="text-2xl font-bold">{stats?.followers || 0}</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.friends?.map((friend) => (
              <Card key={friend}>
                <CardHeader>
                  <CardTitle>{friend}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Recent activity will be shown here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

