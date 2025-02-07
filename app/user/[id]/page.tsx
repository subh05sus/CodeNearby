/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/types";
import { PostCard } from "@/components/post-card";
import { formatDistanceToNow } from "date-fns";
import { fetchGitHubActivities } from "@/lib/github";
import { useSession } from "next-auth/react";

interface Post {
  _id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  votes: { up: number; down: number };
  userVotes: Record<string, number>;
  comments: Comment[];
  poll?: Poll;
  location?: { lat: number; lng: number };
  schedule?: string;
}

interface Comment {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  votes: { up: number; down: number };
  userVotes: Record<string, number>;
  replies: Comment[];
  user?: {
    name: string;
    image: string;
  };
}

interface Poll {
  question: string;
  options: string[];
  votes: Record<string, number>;
}

export default function UserProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);

  const loadActivities = async (username: string) => {
    try {
      const data = await fetchGitHubActivities(username);
      setActivities(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub activities.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  useEffect(() => {
    if (profile) {
      fetchGitHubStats();
      fetchUserPosts();
      loadActivities(profile.githubUsername);
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
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
    if (!profile?.githubUsername) return;
    try {
      const response = await fetch(
        `https://api.github.com/users/${profile.githubUsername}`
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

  const fetchUserPosts = async () => {
    if (!profile) {
      console.log("No profile found, returning");
      return;
    }
    try {
      const response = await fetch(`/api/posts/user/${profile._id}`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user posts.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              votes: updatedPost.votes,
              userVotes: updatedPost.userVotes,
            };
          }
          return post;
        })
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      const newComment = updatedPost.comment;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          }
          return post;
        })
      );

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote on poll");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, poll: updatedPost.poll };
          }
          return post;
        })
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote on poll",
        variant: "destructive",
      });
    }
  };

  const handleCommentVote = async (
    postId: string,
    commentId: string,
    voteType: "up" | "down"
  ) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to vote on comment");
      }

      const updatedComment = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId
                  ? {
                      ...comment,
                      votes: updatedComment.votes,
                      userVotes: updatedComment.userVotes,
                    }
                  : comment
              ),
            };
          }
          return post;
        })
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote on comment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>The requested user profile could not be found.</p>
      </div>
    );
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
            <p className="text-sm text-muted-foreground">
              ID: {profile.githubId}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href={`https://github.com/${profile.githubUsername}`}
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
            <span className="text-2xl font-bold">
              {profile.friends?.length || 0}
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

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              {(() => {
                if (activities.length === 0) {
                  return (
                    <p className="text-muted-foreground">
                      No recent GitHub activity found.
                    </p>
                  );
                }
                return (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 py-3 border-b"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {activity.type.replace("Event", "")}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {formatDistanceToNow(
                                new Date(activity.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                          <Link
                            href={`https://github.com/${activity.repo.name}`}
                            className="text-sm hover:underline text-muted-foreground"
                            target="_blank"
                          >
                            {activity.repo.name}
                          </Link>
                          {activity.payload?.commits && (
                            <div className="mt-2 space-y-1">
                              {activity.payload.commits.map((commit: any) => (
                                <div key={commit.sha} className="text-sm">
                                  <Link
                                    href={`https://github.com/${activity.repo.name}/commit/${commit.sha}`}
                                    className="text-xs font-mono text-muted-foreground hover:underline"
                                    target="_blank"
                                  >
                                    {commit.sha.substring(0, 7)}
                                  </Link>
                                  <span className="ml-2">{commit.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts">
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onVote={handleVote}
                onAddComment={handleAddComment}
                onVotePoll={handleVotePoll}
                onCommentVote={handleCommentVote}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
