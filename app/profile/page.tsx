/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  Settings,
  Share2,
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
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { motion } from "framer-motion";

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

  const themeColor = (theme: string | undefined) => {
    switch (theme) {
      case "blue": return "hsl(217 91% 60%)";
      case "green": return "hsl(142 71% 45%)";
      case "purple": return "hsl(270 70% 60%)";
      case "orange": return "hsl(24 95% 53%)";
      default: return "hsl(24 95% 53%)";
    }
  };

  const currentColor = themeColor(appearance?.theme);

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
      toast.error("Error", { description: "Failed to fetch profile." });
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubStats = async () => {
    if (!session?.user?.githubUsername) return;
    try {
      const response = await fetch(`https://api.github.com/users/${session.user.githubUsername}`);
      const data = await response.json();
      setStats(data);
    } catch {
      toast.error("Error", { description: "Failed to fetch GitHub stats." });
    }
  };

  const fetchUserPosts = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/posts/user/${session.user.id}`);
      const data = await response.json();
      setPosts(data);
    } catch {
      toast.error("Error", { description: "Failed to fetch user posts." });
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Friend removed successfully.");
        fetchProfile();
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch {
      toast.error("Error", { description: "Failed to remove friend." });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) { toast.error("You must be logged in to vote"); return; }
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, votes: updatedPost.votes, userVotes: updatedPost.userVotes }
            : post
        )
      );
    } catch {
      toast.error("Error", { description: "Failed to vote" });
    }
  };

  const handleAddComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!session) { toast.error("You must be logged in to comment"); return; }
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const updatedPost = await response.json();
      const newComment = updatedPost.comment;
      const addCommentToHierarchy = (comments: Comment[], newComment: Comment, parentId?: string): Comment[] => {
        if (!parentId) return [...comments, newComment];
        return comments.map((comment) => {
          if (comment._id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), newComment] };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: addCommentToHierarchy(comment.replies, newComment, parentId) };
          }
          return comment;
        });
      };
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: addCommentToHierarchy(post.comments, newComment, parentCommentId) }
            : post
        )
      );
      toast.success("Comment added successfully");
    } catch {
      toast.error("Error", { description: "Failed to add comment" });
    }
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!session) { toast.error("You must be logged in to vote"); return; }
    try {
      const response = await fetch(`/api/posts/${postId}/poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      if (!response.ok) throw new Error("Failed to vote on poll");
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? { ...post, poll: updatedPost.poll } : post))
      );
    } catch {
      toast.error("Error", { description: "Failed to vote on poll" });
    }
  };

  const handleCommentVote = async (postId: string, commentId: string, voteType: "up" | "down") => {
    if (!session) { toast.error("You must be logged in to vote"); return; }
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error("Failed to vote on comment");
      const updatedComment = await response.json();
      const updateCommentVotes = (comments: Comment[], targetId: string): Comment[] =>
        comments.map((comment) => {
          if (comment._id === targetId) {
            return { ...comment, votes: updatedComment.votes, userVotes: updatedComment.userVotes };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentVotes(comment.replies, targetId) };
          }
          return comment;
        });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: updateCommentVotes(post.comments, commentId) }
            : post
        )
      );
    } catch {
      toast.error("Error", { description: "Failed to vote on comment" });
    }
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${session?.user?.name} on CodeNearby`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile URL copied!");
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Users className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="font-heading text-xl mb-1">Sign in to view your profile</h1>
          <p className="text-sm text-muted-foreground">Connect with GitHub to get started.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 mx-auto max-w-6xl">
      {appearance?.showSpotlight && (
        <div className="absolute top-0 right-0 w-full -z-50">
          <div className="w-full rounded-md -z-50 flex md:items-center md:justify-center antialiased dark:bg-transparent relative overflow-hidden h-[calc(100vh-10rem)]">
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
        <div className="pt-20 pb-6">
          {/* Name + actions row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold font-heading">{session.user.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="font-mono">@{session.user.githubUsername}</span>
                {stats?.location && (
                  <>
                    <span className="opacity-40">·</span>
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{stats.location}</span>
                  </>
                )}
                {stats?.company && (
                  <>
                    <span className="opacity-40">·</span>
                    <Building className="h-3.5 w-3.5" />
                    <span>{stats.company}</span>
                  </>
                )}
              </div>
              {profile?.githubBio && (
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">{profile.githubBio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleShareProfile}
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link href="/profile/edit">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full text-white"
                style={{ background: currentColor }}
                asChild
              >
                <Link
                  href={`https://github.com/${session.user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3.5 w-3.5 mr-1.5" />
                  GitHub
                </Link>
              </Button>
              {stats?.twitter_username && (
                <Button
                  size="sm"
                  className="rounded-full text-white"
                  style={{ background: currentColor }}
                  asChild
                >
                  <Link href={`https://twitter.com/${stats.twitter_username}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-3.5 w-3.5 mr-1.5" />
                    Twitter
                  </Link>
                </Button>
              )}
              {stats?.blog && (
                <Button
                  size="sm"
                  className="rounded-full text-white"
                  style={{ background: currentColor }}
                  asChild
                >
                  <Link href={stats.blog} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                    Website
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {profile.skills.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-full cursor-default font-medium text-xs"
                  style={{
                    background: `${currentColor}18`,
                    color: currentColor,
                    border: `1px solid ${currentColor}30`,
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: <Users className="h-4 w-4" />, value: profile?.friends?.length || 0, label: "Friends" },
              { icon: <GitBranch className="h-4 w-4" />, value: stats?.public_repos || 0, label: "Repositories" },
              { icon: <Star className="h-4 w-4" />, value: stats?.followers || 0, label: "Followers" },
              { icon: <Calendar className="h-4 w-4" />, value: new Date(stats?.created_at || Date.now()).getFullYear(), label: "Joined GitHub" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-1"
                style={{ borderColor: `${currentColor}20` }}
              >
                <span style={{ color: currentColor }}>{stat.icon}</span>
                <span className="text-2xl font-bold font-mono">{stat.value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Pinned Repositories */}
          {profile?.pinnedRepos && profile.pinnedRepos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <Pin className="h-4 w-4" style={{ color: currentColor }} />
                  Pinned Repositories
                </h2>
                <Button variant="ghost" size="sm" className="rounded-full text-xs" asChild>
                  <Link href="/profile/edit?tab=repositories">Edit Pins</Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {profile.pinnedRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col h-full">
                      <h3 className="font-medium hover:underline mb-1">
                        <Link
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors"
                          style={{ color: currentColor }}
                        >
                          {repo.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
                        {repo.description || "No description available"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: currentColor }}
                            />
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {repo.forks_count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="w-fit justify-start rounded-2xl bg-muted/50 border border-border p-1">
            <TabsTrigger value="friends" className="flex items-center gap-1.5 rounded-xl">
              <Users className="h-3.5 w-3.5" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-1.5 rounded-xl">
              <Activity className="h-3.5 w-3.5" />
              Posts
            </TabsTrigger>
            {appearance?.showActivity && (
              <TabsTrigger value="activity" className="flex items-center gap-1.5 rounded-xl">
                <Github className="h-3.5 w-3.5" />
                GitHub Activity
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="friends" className="space-y-3">
            {profile?.friends?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">No Friends Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start connecting with other developers!</p>
                <Button
                  size="sm"
                  className="rounded-full text-white"
                  style={{ background: currentColor }}
                  asChild
                >
                  <Link href="/discover">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Find Friends
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {profile?.friends?.map((friend) => (
                  <div key={friend.githubId} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={friend.image} />
                        <AvatarFallback>{friend.githubUsername[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link
                              href={`https://github.com/${friend.githubUsername}`}
                              className="font-medium hover:underline truncate block text-sm"
                              target="_blank"
                            >
                              {friend.githubUsername}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72 rounded-2xl">
                            <div className="flex gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={friend.image} />
                                <AvatarFallback>{friend.githubUsername[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{friend.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">@{friend.githubUsername}</p>
                                {friend.githubBio && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{friend.githubBio}</p>
                                )}
                                {friend.githubLocation && (
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {friend.githubLocation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Button variant="outline" size="sm" className="rounded-xl h-7 text-xs" asChild>
                            <Link href={`/user/${friend.githubId}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              Profile
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl h-7 text-xs" asChild>
                            <Link href={`/messages/${friend.githubId}`}>
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => removeFriend(friend.githubId)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">No Posts Yet</h3>
                <p className="text-sm text-muted-foreground">Share your thoughts with the community!</p>
              </div>
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
          </TabsContent>

          <TabsContent value="activity">
            <div className="rounded-2xl border border-border bg-card p-5">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Github className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-1">No Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Your GitHub activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-5 border-b last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs rounded-full font-mono"
                            style={{ background: `${currentColor}15`, color: currentColor }}
                          >
                            {activity.type.replace("Event", "")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <Link
                          href={`https://github.com/${activity.repo.name}`}
                          className="text-sm font-medium hover:underline"
                          target="_blank"
                          style={{ color: currentColor }}
                        >
                          {activity.repo.name}
                        </Link>
                        {activity.payload?.commits && (
                          <div className="mt-2 space-y-1.5">
                            {activity.payload.commits.map((commit: any) => (
                              <div key={commit.sha} className="text-xs flex items-center gap-2">
                                <Link
                                  href={`https://github.com/${activity.repo.name}/commit/${commit.sha}`}
                                  className="font-mono text-muted-foreground hover:underline"
                                  target="_blank"
                                >
                                  {commit.sha.substring(0, 7)}
                                </Link>
                                <span className="text-muted-foreground truncate">{commit.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="font-heading text-xl mb-4">Activity Overview</h2>
          <ActivityHeatmap
            data={{ posts, themeColor: appearance?.theme || "green" }}
          />
        </div>
      </div>
    </div>
  );
}
