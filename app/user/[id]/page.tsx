/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Users, GitBranch, Star, LinkIcon, Github, Twitter, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { UserProfile } from "@/types"

export default function UserProfilePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
    fetchGitHubStats()
  }, [params.id, profile?.githubUsername]) // Added profile?.githubUsername to dependencies

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`)
      const data = await response.json()
      setProfile(data)
    } catch  {
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
    if (!profile?.githubUsername) return
    try {
      const response = await fetch(`https://api.github.com/users/${profile.githubUsername}`)
      const data = await response.json()
      setStats(data)
    } catch  {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub stats.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>The requested user profile could not be found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <Image
            src={profile.image || "/placeholder.svg"}
            alt={profile.name || "Profile"}
            width={96}
            height={96}
            className="rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.githubUsername}</p>
            <p className="text-sm text-muted-foreground">ID: {profile.githubId}</p>
            <div className="flex items-center gap-2 mt-2">
              <Link href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Profile
                </Button>
              </Link>
              {stats?.twitter_username && (
                <Link href={`https://twitter.com/${stats.twitter_username}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                </Link>
              )}
              {stats?.blog && (
                <Link href={stats.blog} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </Link>
              )}
              <Link href={`/messages/${profile.githubId}`}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
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
            <span className="text-2xl font-bold">{profile.friends?.length || 0}</span>
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

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

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

