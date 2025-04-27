/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Users,
  GitBranch,
  Star,
  LinkIcon,
  Github,
  Twitter,
  Eye,
  MessageSquare,
  Building,
  MapPin,
  Activity,
  UserPlus,
  Trash2,
  Calendar,
  Pin,
  GitFork,
} from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/types";
import { PostCard } from "@/components/post-card";
import { Session } from "next-auth";
import { fetchGitHubActivities } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";
import LoginButton from "@/components/login-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
import ProfileHeader from "@/components/home/ProfileHeader";
import { MasonryGrid } from "@/components/masonry-grid";
import { toast } from "sonner";
import { Spotlight } from "@/components/ui/spotlight-new";

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
  user: {
    name: string;
    image: string;
    githubUsername: string;
  };
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

export default function ProfilePage() {
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>(() => []);
  const [activities, setActivities] = useState<any[]>([]);
  const [appearance, setAppearance] = useState<{
    theme: "default" | "blue" | "green" | "purple" | "orange";
    showActivity: boolean;
    compactPosts: boolean;
    highlightCode: boolean;
    showSpotlight: boolean;
  } | null>(null);

  const loadActivities = async () => {
    if (!session?.user?.githubUsername) return;
    if (appearance?.showActivity === false) return;
    try {
      const data = await fetchGitHubActivities(session.user.githubUsername);
      setActivities(data);
    } catch {
      toast.error("Failed to fetch GitHub activities. Please try again.");
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchGitHubStats();
      fetchUserPosts();
    }
  }, [session]);

  useEffect(() => {
    if (session && appearance) {
      loadActivities();
    }
  }, [session, appearance?.showActivity]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setProfile(data);
      setAppearance(
        data.appearance || {
          theme: "default",
          showActivity: true,
          compactPosts: false,
          highlightCode: false,
          showSpotlight: true,
        }
      );
    } catch {
      toast.error("Error", {
        description: "Failed to fetch profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubStats = async () => {
    if (!session?.user?.githubUsername) return;
    try {
      const response = await fetch(
        `https://api.github.com/users/${session.user.githubUsername}`
      );
      const data = await response.json();
      setStats(data);
    } catch {
      toast.error("Error", {
        description: "Failed to fetch GitHub stats.",
      });
    }
  };

  const fetchUserPosts = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/posts/user/${session.user.id}`);
      const data = await response.json();
      setPosts(data);
    } catch {
      toast.error("Error", {
        description: "Failed to fetch user posts.",
      });
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Success", {
          description: "Friend removed successfully.",
        });
        fetchProfile();
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch {
      toast.error("Error", {
        description: "Failed to remove friend.",
      });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast.error("Error", {
        description: "You must be logged in to vote",
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
      toast.error("Error", {
        description: "Failed to vote",
      });
    }
  };

  const handleAddComment = async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    if (!session) {
      toast.error("Error", {
        description: "You must be logged in to comment",
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
      const addCommentToHierarchy = (
        comments: Comment[],
        newComment: Comment,
        parentId?: string
      ): Comment[] => {
        if (!parentId) {
          return [...comments, newComment];
        }

        return comments.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addCommentToHierarchy(
                comment.replies,
                newComment,
                parentId
              ),
            };
          }
          return comment;
        });
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: addCommentToHierarchy(
                post.comments,
                newComment,
                parentCommentId
              ),
            };
          }
          return post;
        })
      );

      toast.success("Success", {
        description: "Comment added successfully",
      });
    } catch {
      toast.error("Error", {
        description: "Failed to add comment",
      });
    }
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!session) {
      toast.error("Error", {
        description: "You must be logged in to vote",
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
      toast.error("Error", {
        description: "Failed to vote on poll",
      });
    }
  };

  const handleCommentVote = async (
    postId: string,
    commentId: string,
    voteType: "up" | "down"
  ) => {
    if (!session) {
      toast.error("Error", {
        description: "You must be logged in to vote",
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
      const updateCommentVotes = (
        comments: Comment[],
        targetId: string
      ): Comment[] => {
        return comments.map((comment) => {
          if (comment._id === targetId) {
            return {
              ...comment,
              votes: updatedComment.votes,
              userVotes: updatedComment.userVotes,
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentVotes(comment.replies, targetId),
            };
          }
          return comment;
        });
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: updateCommentVotes(post.comments, commentId),
            };
          }
          return post;
        })
      );
    } catch {
      toast.error("Error", {
        description: "Failed to vote on comment",
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view your profile.</p>
        <LoginButton />
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
    <div className="w-full px-2 mx-auto max-w-6xl">
      {appearance?.showSpotlight && (
        <div className="absolute top-0 right-0 w-full -z-50">
          <div className="w-full rounded-md -z-50 flex md:items-center md:justify-center antialiased dark:bg-transparent  relative overflow-hidden h-[calc(100vh-10rem)]">
            <Spotlight themeColor={appearance?.theme} />
          </div>
        </div>
      )}
      <ProfileHeader
        imageUrl={session.user.image || "/placeholder.svg"}
        editable={true}
        bannerUrl={profile?.bannerImage || "/bg.webp"}
        appearance={profile?.appearance}
      />

      <div className="max-w-6xl mx-auto px-4">
        <div className="pt-20 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{session.user.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground portrait:text-xs">
                <span>@{session.user.githubUsername}</span>
                {stats?.location && (
                  <>
                    <span>•</span>
                    <MapPin className="h-4 w-4" />
                    <span>{stats.location}</span>
                  </>
                )}
                {stats?.company && (
                  <>
                    <span>•</span>
                    <Building className="h-4 w-4" />
                    <span>{stats.company}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm portrait:text-xs">
                {profile?.githubBio && <span>{profile?.githubBio}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  appearance?.theme !== "default" ? "default" : "outline"
                }
                className={
                  appearance?.theme !== "default"
                    ? `${
                        appearance?.theme === "blue"
                          ? "dark:bg-blue-900 dark:hover:bg-blue-950 text-white  bg-blue-500 hover:bg-blue-600 "
                          : appearance?.theme === "green"
                          ? "dark:bg-green-900 dark:hover:bg-green-950 text-white  bg-green-500 hover:bg-green-600 "
                          : appearance?.theme === "purple"
                          ? "dark:bg-purple-900 dark:hover:bg-purple-950 text-white  bg-purple-500 hover:bg-purple-600 "
                          : appearance?.theme === "orange"
                          ? "dark:bg-orange-900 dark:hover:bg-orange-950 text-white  bg-orange-500 hover:bg-orange-600 "
                          : ""
                      } `
                    : ""
                }
                size="sm"
                asChild
              >
                <Link
                  href={`https://github.com/${session.user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              {stats?.twitter_username && (
                <Button
                  variant={
                    appearance?.theme !== "default" ? "default" : "outline"
                  }
                  className={
                    appearance?.theme !== "default"
                      ? `${
                          appearance?.theme === "blue"
                            ? "dark:bg-blue-900 dark:hover:bg-blue-950 text-white  bg-blue-500 hover:bg-blue-600 "
                            : appearance?.theme === "green"
                            ? "dark:bg-green-900 dark:hover:bg-green-950 text-white  bg-green-500 hover:bg-green-600 "
                            : appearance?.theme === "purple"
                            ? "dark:bg-purple-900 dark:hover:bg-purple-950 text-white  bg-purple-500 hover:bg-purple-600 "
                            : appearance?.theme === "orange"
                            ? "dark:bg-orange-900 dark:hover:bg-orange-950 text-white  bg-orange-500 hover:bg-orange-600 "
                            : ""
                        } `
                      : ""
                  }
                  size="sm"
                  asChild
                >
                  <Link
                    href={`https://twitter.com/${stats.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Link>
                </Button>
              )}
              {stats?.blog && (
                <Button
                  variant={
                    appearance?.theme !== "default" ? "default" : "outline"
                  }
                  className={
                    appearance?.theme !== "default"
                      ? `${
                          appearance?.theme === "blue"
                            ? "dark:bg-blue-900 dark:hover:bg-blue-950 text-white  bg-blue-500 hover:bg-blue-600 "
                            : appearance?.theme === "green"
                            ? "dark:bg-green-900 dark:hover:bg-green-950 text-white  bg-green-500 hover:bg-green-600 "
                            : appearance?.theme === "purple"
                            ? "dark:bg-purple-900 dark:hover:bg-purple-950 text-white  bg-purple-500 hover:bg-purple-600 "
                            : appearance?.theme === "orange"
                            ? "dark:bg-orange-900 dark:hover:bg-orange-950 text-white  bg-orange-500 hover:bg-orange-600 "
                            : ""
                        } `
                      : ""
                  }
                  size="sm"
                  asChild
                >
                  <Link
                    href={stats.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Website
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card
              className={
                appearance?.theme !== "default"
                  ? `${
                      appearance?.theme === "blue"
                        ? "dark:bg-blue-500 bg-blue-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "green"
                        ? "dark:bg-green-500 bg-green-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "purple"
                        ? "dark:bg-purple-500 bg-purple-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "orange"
                        ? "dark:bg-orange-500 bg-orange-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : ""
                    } transition-all duration-200`
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Users
                    className={`h-5 w-5 mb-2 text-primary ${
                      appearance?.theme === "blue"
                        ? "text-blue-500"
                        : appearance?.theme === "green"
                        ? "text-green-500"
                        : appearance?.theme === "purple"
                        ? "text-purple-500"
                        : appearance?.theme === "orange"
                        ? "text-orange-500"
                        : ""
                    }`}
                  />
                  <span className="text-2xl font-bold">
                    {profile?.friends?.length || 0}
                  </span>
                  <span className="text-sm dark:text-muted-foreground">
                    Friends
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={
                appearance?.theme !== "default"
                  ? `${
                      appearance?.theme === "blue"
                        ? "dark:bg-blue-500 bg-blue-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "green"
                        ? "dark:bg-green-500 bg-green-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "purple"
                        ? "dark:bg-purple-500 bg-purple-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "orange"
                        ? "dark:bg-orange-500 bg-orange-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : ""
                    } transition-all duration-200`
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <GitBranch
                    className={`h-5 w-5 mb-2 text-primary ${
                      appearance?.theme === "blue"
                        ? "text-blue-500"
                        : appearance?.theme === "green"
                        ? "text-green-500"
                        : appearance?.theme === "purple"
                        ? "text-purple-500"
                        : appearance?.theme === "orange"
                        ? "text-orange-500"
                        : ""
                    }`}
                  />
                  <span className="text-2xl font-bold">
                    {stats?.public_repos || 0}
                  </span>
                  <span className="text-sm dark:text-muted-foreground">
                    Repositories
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={
                appearance?.theme !== "default"
                  ? `${
                      appearance?.theme === "blue"
                        ? "dark:bg-blue-500 bg-blue-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "green"
                        ? "dark:bg-green-500 bg-green-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "purple"
                        ? "dark:bg-purple-500 bg-purple-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "orange"
                        ? "dark:bg-orange-500 bg-orange-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : ""
                    } transition-all duration-200`
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Star
                    className={`h-5 w-5 mb-2 text-primary ${
                      appearance?.theme === "blue"
                        ? "text-blue-500"
                        : appearance?.theme === "green"
                        ? "text-green-500"
                        : appearance?.theme === "purple"
                        ? "text-purple-500"
                        : appearance?.theme === "orange"
                        ? "text-orange-500"
                        : ""
                    }`}
                  />
                  <span className="text-2xl font-bold">
                    {stats?.followers || 0}
                  </span>
                  <span className="text-sm dark:text-muted-foreground">
                    Followers
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={
                appearance?.theme !== "default"
                  ? `${
                      appearance?.theme === "blue"
                        ? "dark:bg-blue-500 bg-blue-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "green"
                        ? "dark:bg-green-500 bg-green-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "purple"
                        ? "dark:bg-purple-500 bg-purple-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : appearance?.theme === "orange"
                        ? "dark:bg-orange-500 bg-orange-300 bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-10 dark:hover:bg-opacity-20"
                        : ""
                    } transition-all duration-200`
                  : ""
              }
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Calendar
                    className={`h-5 w-5 mb-2 text-primary ${
                      appearance?.theme === "blue"
                        ? "text-blue-500"
                        : appearance?.theme === "green"
                        ? "text-green-500"
                        : appearance?.theme === "purple"
                        ? "text-purple-500"
                        : appearance?.theme === "orange"
                        ? "text-orange-500"
                        : ""
                    }`}
                  />
                  <span className="text-2xl font-bold">
                    {new Date(stats?.created_at || Date.now()).getFullYear()}
                  </span>
                  <span className="text-sm dark:text-muted-foreground">
                    Joined GitHub
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pinned Repositories Section */}
          {profile?.pinnedRepos && profile.pinnedRepos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Pinned Repositories</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/edit?tab=repositories">
                    <Pin className="h-4 w-4 mr-2" />
                    Edit Pins
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.pinnedRepos.map((repo) => (
                  <Card key={repo.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div>
                            <h3 className="font-medium hover:underline">
                              <Link
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {repo.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {repo.description || "No description available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-auto">
                          {repo.language && (
                            <div className="flex items-center">
                              <span
                                className={`h-3 w-3 rounded-full bg-${appearance?.theme}-500/70 mr-1.5`}
                              ></span>
                              <span>{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center">
                            <GitFork className="h-4 w-4 mr-1" />
                            <span>{repo.forks_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="w-fit justify-start">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Posts
            </TabsTrigger>
            {appearance?.showActivity && (
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Activity
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {profile?.friends?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Friends Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start connecting with other developers!
                  </p>
                  <Button asChild>
                    <Link href="/discover">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {profile?.friends?.map((friend) => (
                  <Card key={friend.githubId} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.image} />
                          <AvatarFallback>
                            {friend.githubUsername[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Link
                                href={`https://github.com/${friend.githubUsername}`}
                                className="font-medium hover:underline truncate block"
                                target="_blank"
                              >
                                {friend.githubUsername}
                              </Link>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={friend.image} />
                                  <AvatarFallback>
                                    {friend.githubUsername[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold">
                                    {friend.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    @{friend.githubUsername}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {friend.githubBio}
                                  </p>
                                  {friend.githubLocation && (
                                    <p className="text-xs text-muted-foreground">
                                      <MapPin className=" h-3 w-3 inline-block mr-2" />
                                      {friend.githubLocation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/user/${friend.githubId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                            </Button>
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/messages/${friend.githubId}`}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFriend(friend.githubId)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
                    <p className="text-muted-foreground">
                      Share your thoughts with the community!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <MasonryGrid>
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onVote={handleVote}
                      onAddComment={handleAddComment}
                      onVotePoll={handleVotePoll}
                      onCommentVote={handleCommentVote}
                      compactView={appearance?.compactPosts}
                    />
                  ))}
                </MasonryGrid>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No Recent Activity
                    </h3>
                    <p className="text-muted-foreground">
                      Your GitHub activity will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 pb-6 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              {activity.type.replace("Event", "")}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(activity.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                          <Link
                            href={`https://github.com/${activity.repo.name}`}
                            className="text-sm font-medium hover:underline"
                            target="_blank"
                          >
                            {activity.repo.name}
                          </Link>
                          {activity.payload?.commits && (
                            <div className="mt-2 space-y-2">
                              {activity.payload.commits.map((commit: any) => (
                                <div key={commit.sha} className="text-sm">
                                  <Link
                                    href={`https://github.com/${activity.repo.name}/commit/${commit.sha}`}
                                    className="font-mono text-xs text-muted-foreground hover:underline"
                                    target="_blank"
                                  >
                                    {commit.sha.substring(0, 7)}
                                  </Link>
                                  <span className="ml-2 text-muted-foreground">
                                    {commit.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
