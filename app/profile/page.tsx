/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Users,
  GitBranch,
  Star,
  LinkIcon,
  Github,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/types";
import { fetchGitHubActivities } from "@/lib/github";
import { Session } from "next-auth";

export default function ProfilePage() {
  const { data: session } = useSession() as { data: Session | null }
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchGitHubStats();
      fetchActivities();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setProfile(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubStats = async () => {
    if (!session?.user?.githubUsername) return;
    try {
      const response = await fetch(
        `https://api.github.com/users/${session.user?.githubUsername}`
      );
      const data = await response.json();
      setStats(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub stats.",
        variant: "destructive",
      });
    }
  };

  const fetchActivities = async () => {
    console.log("fetchActivities");
    if (!session?.user?.githubUsername) return;
    try {
      const data = await fetchGitHubActivities(session.user?.githubUsername);
      console.log(data);
      setActivities(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub activities.",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Friend removed successfully.",
        });
        fetchProfile();
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove friend.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-6">
          <Image
            src={session.user?.image || "/placeholder.svg"}
            alt={session.user?.name || "Profile"}
            width={96}
            height={96}
            className="rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">{session.user?.name}</h1>
            <p className="text-muted-foreground">
              @{session.user?.githubUsername}
            </p>
            <p className="text-sm text-muted-foreground">
              GitHub ID: {session.user?.githubId}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href={`https://github.com/${session.user?.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Profile
                </Button>
              </Link>
              {stats?.twitter_username && (
                <Link
                  href={`https://twitter.com/${stats.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                </Link>
              )}
              {stats?.blog && (
                <Link
                  href={stats.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </Link>
              )}
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
            <span className="text-2xl font-bold">
              {profile?.friends?.length || 0}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Repositories</span>
            </div>
            <span className="text-2xl font-bold">
              {stats?.public_repos || 0}
            </span>
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
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.friends?.map((friend: any) => (
              <Card key={friend.githubId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <Link
                      href={`https://github.com/${friend.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {friend.githubUsername}
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFriend(friend.githubId)}
                    >
                      Remove
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              {activities?.map((activity: any) => (
                <div
                  key={activity.id}
                  className="mb-4 border p-3 rounded-lg shadow-sm bg-white"
                >
                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>

                  {/* Activity Type */}
                  <p className="text-sm font-semibold">{activity.type}</p>

                  {/* Repository Name with Link */}
                  <p className="text-sm">
                    Repository:{" "}
                    <Link
                      href={`https://github.com/${activity.repo.name}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {activity.repo.name}
                    </Link>
                  </p>

                  {/* Commit Details */}
                  {activity.payload?.commits?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Recent Commits:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {activity.payload.commits.map((commit: any) => (
                          <li key={commit.sha}>
                            <p>
                                <Link
                                href={commit.url.replace(
                                  "api.github.com/repos",
                                  "github.com"
                                )}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                {commit.message}
                                </Link>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Author: {commit.author.name} (
                              {commit.author.email})
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
