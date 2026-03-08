/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import {
  Loader2,
  Users,
  GitBranch,
  Star,
  LinkIcon,
  Github,
  Twitter,
  MessageSquare,
  Building,
  MapPin,
  Activity,
  Trash2,
  Calendar,
  Pin,
  GitFork,
  Settings,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { UserProfile } from "@/types";
import { PostCard } from "@/components/post-card";
import { Session } from "next-auth";
import { fetchGitHubActivities } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";
import LoginButton from "@/components/login-button";
import ProfileHeader from "@/components/home/ProfileHeader";
import { MasonryGrid } from "@/components/masonry-grid";
import { toast } from "sonner";
import { Spotlight } from "@/components/ui/spotlight-new";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("activities");
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
        <div className="pt-24 pb-12 border-b-8 border-swiss-black">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8]">
                {session.user.name?.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="bg-swiss-black text-swiss-white px-3 py-1 font-black text-sm tracking-widest">
                  @{session.user.githubUsername?.toUpperCase()}
                </div>

                {stats?.location && (
                  <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-tight opacity-60">
                    <MapPin className="h-4 w-4 stroke-[3]" />
                    <span>{stats.location}</span>
                  </div>
                )}

                {stats?.company && (
                  <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-tight opacity-60">
                    <Building className="h-4 w-4 stroke-[3]" />
                    <span>{stats.company}</span>
                  </div>
                )}
              </div>

              {profile?.githubBio && (
                <p className="mt-6 max-w-2xl font-bold uppercase tracking-tight text-lg leading-tight opacity-80 italic">
                  &ldquo;{profile.githubBio}&ldquo;
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <SwissButton variant="secondary" size="sm" asChild>
                <Link
                  href={`https://github.com/${session.user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GITHUB_ID
                </Link>
              </SwissButton>

              {stats?.twitter_username && (
                <SwissButton variant="secondary" size="sm" asChild>
                  <Link
                    href={`https://twitter.com/${stats.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    SIGNAL_X
                  </Link>
                </SwissButton>
              )}

              {stats?.blog && (
                <SwissButton variant="secondary" size="sm" asChild>
                  <Link
                    href={stats.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    DOMAIN_LINK
                  </Link>
                </SwissButton>
              )}
            </div>
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-3">
              {profile.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="px-4 py-2 border-4 border-swiss-black font-black uppercase text-xs tracking-widest hover:bg-swiss-black hover:text-swiss-white transition-all cursor-default"
                >
                  {skill}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <SwissCard className="p-8 group hover:bg-swiss-black transition-all duration-300">
            <div className="flex flex-col items-center">
              <Users className="h-6 w-6 mb-4 group-hover:text-swiss-white" />
              <span className="text-6xl font-black tracking-tighter group-hover:text-swiss-white leading-none">
                {profile?.friends?.length || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-40 group-hover:text-swiss-white group-hover:opacity-100">
                FRIENDS_NODE
              </span>
            </div>
          </SwissCard>

          <SwissCard className="p-8 group hover:bg-swiss-red transition-all duration-300">
            <div className="flex flex-col items-center">
              <GitBranch className="h-6 w-6 mb-4 group-hover:text-swiss-white" />
              <span className="text-6xl font-black tracking-tighter group-hover:text-swiss-white leading-none">
                {stats?.public_repos || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-40 group-hover:text-swiss-white group-hover:opacity-100">
                REPO_SYNC
              </span>
            </div>
          </SwissCard>

          <SwissCard className="p-8 group hover:bg-swiss-black transition-all duration-300">
            <div className="flex flex-col items-center">
              <Star className="h-6 w-6 mb-4 group-hover:text-swiss-white" />
              <span className="text-6xl font-black tracking-tighter group-hover:text-swiss-white leading-none">
                {stats?.followers || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-40 group-hover:text-swiss-white group-hover:opacity-100">
                FOLLOWERS
              </span>
            </div>
          </SwissCard>

          <SwissCard className="p-8 group hover:bg-swiss-red transition-all duration-300">
            <div className="flex flex-col items-center">
              <Calendar className="h-6 w-6 mb-4 group-hover:text-swiss-white" />
              <span className="text-6xl font-black tracking-tighter group-hover:text-swiss-white leading-none">
                {stats?.created_at ? new Date(stats.created_at).getFullYear().toString().slice(-2) : "00"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-40 group-hover:text-swiss-white group-hover:opacity-100">
                ESTO_MARK
              </span>
            </div>
          </SwissCard>
        </div>

        {/* Pinned Repositories Section */}
        {profile?.pinnedRepos && profile.pinnedRepos.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-8 border-b-4 border-swiss-black pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter">PINNED_REPOSITORIES</h2>
              <SwissButton variant="secondary" size="sm" asChild>
                <Link href="/profile/edit?tab=repositories" className="flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  MODIFY_PINS
                </Link>
              </SwissButton>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.pinnedRepos.map((repo) => (
                <SwissCard key={repo.id} className="p-8 hover:bg-swiss-muted transition-colors">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Link
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-black uppercase tracking-tight hover:text-swiss-red transition-colors"
                      >
                        {repo.name}
                      </Link>
                      <GitFork className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-tight leading-tight opacity-60 mb-8 line-clamp-2">
                      {repo.description || "NO_DESCRIPTION_AVAILABLE"}
                    </p>
                    <div className="mt-auto flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-swiss-red" />
                        <span className="font-black text-[10px] tracking-widest">{repo.language?.toUpperCase() || "DATA"}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-40">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-black text-[10px] tracking-widest">{repo.stargazers_count}</span>
                      </div>
                    </div>
                  </div>
                </SwissCard>
              ))}
            </div>
          </div>
        )}

        {/* Swiss Custom Tabs Implementation */}
        <div className="mt-24">
          <div className="flex flex-wrap gap-4 mb-12 border-b-8 border-swiss-black pb-8">
            {[
              { id: "activities", label: "NODE_ACTIVITIES", icon: Activity },
              { id: "posts", label: "USER_ENTRIES", icon: MessageSquare },
              { id: "friends", label: "CONNECTION_GRID", icon: Users },
              { id: "settings", label: "TERMINAL_CONFIG", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-8 py-4 border-4 border-swiss-black font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all",
                  activeTab === tab.id
                    ? "bg-swiss-black text-swiss-white shadow-[8px_8px_0_0_rgba(255,0,0,1)] -translate-y-2"
                    : "bg-swiss-white text-swiss-black hover:bg-swiss-muted"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[500px] mb-24">
            {activeTab === "activities" && (
              <div className="space-y-12">
                <SwissCard className="p-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b-4 border-swiss-black pb-4">HEATMAP_VISUALIZATION</h3>
                  <ActivityHeatmap data={{ posts: posts as any, themeColor: appearance?.theme || 'green' }} />
                </SwissCard>

                <div className="grid gap-4">
                  {activities.map((activity, i) => (
                    <div key={i} className="group border-l-8 border-swiss-black hover:border-swiss-red pl-6 py-4 transition-all">
                      <div className="flex items-center gap-4 mb-1">
                        <span className="font-black text-[10px] tracking-widest text-swiss-red uppercase">{activity.type.replace('Event', '')}</span>
                        <span className="text-[10px] font-bold opacity-30 uppercase">{formatDistanceToNow(new Date(activity.createdAt || activity.created_at || Date.now()))} AGO</span>
                      </div>
                      <p className="font-bold uppercase tracking-tight text-lg group-hover:translate-x-2 transition-transform">
                        {activity.repo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-12">
                {posts.length > 0 ? (
                  <MasonryGrid>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post as any}
                        onVote={handleVote}
                        onAddComment={handleAddComment}
                        onVotePoll={handleVotePoll}
                        onCommentVote={handleCommentVote}
                      />
                    ))}
                  </MasonryGrid>
                ) : (
                  <div className="border-8 border-swiss-black p-12 text-center bg-swiss-muted/20">
                    <p className="font-black text-4xl uppercase tracking-tighter opacity-20 leading-none">EMPTY_NODE_BUFFER<br />NO_POSTS_DETECTED</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "friends" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile?.friends?.map((friend: any) => (
                  <SwissCard key={friend.githubId} className="p-6 group hover:bg-swiss-black transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 border-4 border-swiss-black grayscale group-hover:grayscale-0 transition-all overflow-hidden bg-swiss-white">
                        <Image src={friend.image || "/placeholder.svg"} width={64} height={64} alt={friend.name} className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black uppercase tracking-tight truncate group-hover:text-swiss-white text-sm">{friend.name}</h4>
                        <p className="font-bold text-[10px] tracking-widest uppercase opacity-40 group-hover:text-swiss-white group-hover:opacity-100">@{friend.githubUsername}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <SwissButton variant="secondary" size="icon" className="h-10 w-10" asChild>
                          <Link href={`/messages/${friend.githubId}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </SwissButton>
                        <SwissButton variant="secondary" size="icon" className="h-10 w-10 text-swiss-red border-swiss-red hover:bg-swiss-red hover:text-swiss-white" onClick={() => removeFriend(friend.githubId)}>
                          <Trash2 className="h-4 w-4" />
                        </SwissButton>
                      </div>
                    </div>
                  </SwissCard>
                ))}
                {(!profile?.friends || profile.friends.length === 0) && (
                  <div className="col-span-full border-8 border-swiss-black p-12 text-center bg-swiss-muted/20">
                    <p className="font-black text-4xl uppercase tracking-tighter opacity-20">NO_CONNECTIONS_ESTABLISHED</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <SwissCard className="p-12">
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 bg-swiss-black text-swiss-white inline-block px-4 py-1">APPEARANCE_CORE</h3>
                  <div className="space-y-12">
                    <div className="flex items-center justify-between group pb-8 border-b-4 border-swiss-muted">
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">SPOTLIGHT_OVERLAY</p>
                        <p className="text-[10px] font-bold uppercase opacity-40 mt-1">EMIT_VISUAL_ENERGY_PARTICLES</p>
                      </div>
                      <button
                        className={cn(
                          "w-20 h-10 border-4 border-swiss-black relative transition-all",
                          appearance?.showSpotlight ? "bg-swiss-red" : "bg-swiss-muted"
                        )}
                        onClick={() => setAppearance(prev => ({ ...prev!, showSpotlight: !prev?.showSpotlight }))}
                      >
                        <div className={cn("absolute top-0 bottom-0 w-8 bg-swiss-black transition-all", appearance?.showSpotlight ? "right-0" : "left-0")} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between group pb-8 border-b-4 border-swiss-muted">
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">GITHUB_PULSE</p>
                        <p className="text-[10px] font-bold uppercase opacity-40 mt-1">REALTIME_ACTIVITY_MIRRORING</p>
                      </div>
                      <button
                        className={cn(
                          "w-20 h-10 border-4 border-swiss-black relative transition-all",
                          appearance?.showActivity ? "bg-swiss-red" : "bg-swiss-muted"
                        )}
                        onClick={() => setAppearance(prev => ({ ...prev!, showActivity: !prev?.showActivity }))}
                      >
                        <div className={cn("absolute top-0 bottom-0 w-8 bg-swiss-black transition-all", appearance?.showActivity ? "right-0" : "left-0")} />
                      </button>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <SwissButton variant="primary" className="flex-1 h-16 shadow-[8px_8px_0_0_rgba(255,0,0,1)]">
                        SAVE_SYSTEM_PARAMETERS
                      </SwissButton>
                      <SwissButton variant="secondary" size="icon" className="h-16 w-16">
                        <Share2 className="h-6 w-6" />
                      </SwissButton>
                    </div>
                  </div>
                </SwissCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
