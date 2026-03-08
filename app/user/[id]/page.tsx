/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Users,
  GitBranch,
  Star,
  LinkIcon,
  Github,
  Twitter,
  MessageSquare,
  Plus,
  GitFork,
  Calendar,
  Activity,
  Settings,
  Share2,
  Eye,
  Trash2,
  MapPin,
  Building,
  Pin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { UserProfile } from "@/types";
import { PostCard } from "@/components/post-card";
import { formatDistanceToNow } from "date-fns";
import { fetchGitHubActivities } from "@/lib/github";
import { useSession } from "next-auth/react";
import ProfileHeader from "@/components/home/ProfileHeader";
import { MasonryGrid } from "@/components/masonry-grid";
import { Session } from "next-auth";
import { toast } from "sonner";
import GithubCard from "@/components/github-card";
import { Spotlight } from "@/components/ui/spotlight-new";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import SwissSection from "@/components/swiss/SwissSection";
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
    githubId: string;
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

export default function UserProfilePage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  const [appearance, setAppearance] = useState<{
    theme: "default" | "blue" | "green" | "purple" | "orange";
    showActivity: boolean;
    compactPosts: boolean;
    highlightCode: boolean;
    showSpotlight: boolean;
  }>({
    theme: "default",
    showActivity: false,
    compactPosts: false,
    highlightCode: false,
    showSpotlight: false,
  });

  const loadActivities = async (username: string) => {
    if (!username) return;

    try {
      if (appearance?.showActivity) return;
      const data = await fetchGitHubActivities(username);
      setActivities(data);
    } catch {
      toast.error("Error", {
        description: "Failed to fetch GitHub activities.",
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
      // if (data.status === 200) {
      // }
      if (response.ok) {
        setProfile(data);
        setAppearance(data.appearance);
      } else {
        setProfile(null);
        toast.error("Error", { description: "Failed to fetch profile." });
      }
    } catch {
      toast.error("Error", { description: "Failed to fetch profile." });
    } finally {
      setLoading(false);
    }
  };

  if (parseInt(session?.user?.githubId || "") === profile?.githubId) {
    router.push("/profile");
  }

  const fetchGitHubStats = async () => {
    if (!profile?.githubUsername) return;
    try {
      const response = await fetch(
        `https://api.github.com/users/${profile.githubUsername}`
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
    if (!profile) {
      return;
    }
    try {
      const response = await fetch(`/api/posts/user/${profile._id}`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);

      toast.error("Error", {
        description: "Failed to fetch user posts.",
      });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast.error("You must be logged in to vote");
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
      toast.error("Failed to vote");
    }
  };

  const handleAddComment = async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    if (!session) {
      toast.error("You must be logged in to comment");
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

      toast.success("Comment added successfully");
    } catch {
      toast.error("Failed to add comment");
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
      toast.error("Failed to vote on poll");
    }
  };

  const handleCommentVote = async (
    postId: string,
    commentId: string,
    voteType: "up" | "down"
  ) => {
    if (!session) {
      toast.error("You must be logged in to vote");
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
      toast.error("Failed to vote on comment");
    }
  };

  const handleAddFriend = async () => {
    if (!profile) {
      return;
    }
    try {
      await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.githubId,
          login: profile.githubUsername,
          avatar_url: profile.image,
          html_url: `https://github.com/${profile.githubUsername}`,
        }),
      });
      toast.success("Success", { description: "Friend request sent!" });
    } catch {
      toast.error("Error", { description: "Failed to send request." });
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
    return <GithubCard userId={params.id as string} />;
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
        imageUrl={profile.image || "/placeholder.svg"}
        bannerUrl={profile.bannerImage || "/bg.webp"}
        appearance={appearance}
      />

      {/* Profile Info & Actions Section */}
      <SwissSection variant="white" className="mt-[-100px] relative z-10 p-12 mb-12 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 flex-1">
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none italic underline decoration-8 decoration-swiss-red">
              {profile.name}
            </h1>
            <div className="flex flex-wrap gap-4">
              <span className="font-black bg-swiss-black text-swiss-white px-4 py-1 text-xl tracking-widest uppercase">
                @{profile.githubUsername}
              </span>
              {profile.githubLocation && (
                <span className="font-bold border-4 border-swiss-black px-4 py-1 flex items-center gap-2 uppercase text-sm">
                  <MapPin className="h-4 w-4" /> {profile.githubLocation}
                </span>
              )}
            </div>
            {profile.githubBio && (
              <p className="text-2xl font-bold uppercase tracking-tight leading-tight max-w-2xl opacity-80 border-l-8 border-swiss-black pl-6">
                {profile.githubBio}
              </p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {profile.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-swiss-black text-swiss-white text-[10px] font-black uppercase tracking-[0.2em]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {profile.friends?.includes(
              session?.user?.githubId ? parseInt(session.user.githubId) : -1
            ) ? (
              <SwissButton variant="primary" size="lg" className="h-20 text-2xl shadow-[8px_8px_0_0_rgba(255,0,0,1)]" asChild>
                <Link href={`/messages/${profile.githubId}`}>
                  <MessageSquare className="h-8 w-8 mr-4" /> SEND_MESSAGE
                </Link>
              </SwissButton>
            ) : (
              <SwissButton
                variant="primary"
                size="lg"
                className="h-20 text-2xl shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
                onClick={async () => {
                  await handleAddFriend();
                  const btn = document.getElementById(`add-friend-${profile?.githubId}`);
                  if (btn) {
                    btn.textContent = "REQUEST_SENT";
                    (btn as HTMLButtonElement).disabled = true;
                  }
                }}
                id={`add-friend-${profile?.githubId}`}
              >
                <Plus className="h-8 w-8 mr-4" /> ESTABLISH_CONNECTION
              </SwissButton>
            )}

            <div className="grid grid-cols-2 gap-4">
              <SwissButton variant="secondary" className="h-16" asChild>
                <Link href={`https://github.com/${profile.githubUsername}`} target="_blank">
                  <Github className="h-6 w-6 mr-2" /> GITHUB
                </Link>
              </SwissButton>
              {stats?.twitter_username && (
                <SwissButton variant="secondary" className="h-16" asChild>
                  <Link href={`https://twitter.com/${stats.twitter_username}`} target="_blank">
                    <Twitter className="h-6 w-6 mr-2" /> TWITTER
                  </Link>
                </SwissButton>
              )}
            </div>
          </div>
        </div>
      </SwissSection>

      <div className="grid lg:grid-cols-12 gap-12 mb-24">
        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-12">
          <div className="grid grid-cols-1 gap-6">
            <SwissCard variant="accent" className="p-8 group hover:-translate-y-2 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <Users className="h-10 w-10" />
                <span className="text-6xl font-black italic">01</span>
              </div>
              <p className="text-sm font-black tracking-[0.3em] opacity-60 mb-1 uppercase">ESTABLISHED_CONNECTIONS</p>
              <h4 className="text-6xl font-black tracking-tighter leading-none">{profile?.friends?.length || 0}</h4>
            </SwissCard>

            <SwissCard className="p-8 group hover:-translate-y-2 transition-transform shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-4">
                <GitBranch className="h-10 w-10" />
                <span className="text-6xl font-black italic opacity-10">02</span>
              </div>
              <p className="text-sm font-black tracking-[0.3em] opacity-60 mb-1 uppercase">ACTIVE_REPOSITORIES</p>
              <h4 className="text-6xl font-black tracking-tighter leading-none">{stats?.public_repos || 0}</h4>
            </SwissCard>

            <SwissCard className="p-8 group hover:-translate-y-2 transition-transform shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-4">
                <Star className="h-10 w-10" />
                <span className="text-6xl font-black italic opacity-10">03</span>
              </div>
              <p className="text-sm font-black tracking-[0.3em] opacity-60 mb-1 uppercase">TOTAL_FOLLOWERS</p>
              <h4 className="text-6xl font-black tracking-tighter leading-none">{stats?.followers || 0}</h4>
            </SwissCard>
          </div>

          {/* Pinned Repos */}
          {profile.pinnedRepos && profile.pinnedRepos.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-swiss-black pb-4">PINNED_MODULES</h3>
              <div className="space-y-4">
                {profile.pinnedRepos.map((repo) => (
                  <SwissCard key={repo.id} className="p-6 hover:bg-swiss-black hover:text-swiss-white transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <Pin className="h-5 w-5 rotate-45" />
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1 text-[10px] font-black"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-1 text-[10px] font-black"><GitFork className="h-3 w-3" /> {repo.forks_count}</span>
                      </div>
                    </div>
                    <Link href={repo.html_url} target="_blank" className="block text-xl font-black uppercase tracking-tight mb-2 group-hover:underline underline-offset-4">
                      {repo.name}
                    </Link>
                    <p className="text-xs font-bold leading-tight opacity-60 group-hover:opacity-100">{repo.description}</p>
                    {repo.language && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-swiss-red" />
                        <span className="text-[10px] font-black tracking-widest uppercase">{repo.language}</span>
                      </div>
                    )}
                  </SwissCard>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="lg:col-span-8">
          <div className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: "posts", label: "USER_ENTRIES", icon: MessageSquare },
              { id: "activity", label: "PULSE_ACTIVITY", icon: Activity },
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
                        compactView={appearance?.compactPosts}
                      />
                    ))}
                  </MasonryGrid>
                ) : (
                  <div className="border-8 border-swiss-black p-12 text-center bg-swiss-muted/20">
                    <p className="font-black text-4xl uppercase tracking-tighter opacity-20">NO_DATA_AVAILABLE</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-12">
                <SwissCard className="p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b-4 border-swiss-black pb-4">HEATMAP_VISUALIZATION</h3>
                  <ActivityHeatmap data={{ posts: posts as any, themeColor: appearance?.theme || 'green' }} />
                </SwissCard>

                <div className="grid gap-4">
                  {activities.map((activity, i) => (
                    <div key={i} className="group border-l-8 border-swiss-black hover:border-swiss-red pl-6 py-4 transition-all bg-swiss-white">
                      <div className="flex items-center gap-4 mb-1">
                        <span className="font-black text-[10px] tracking-widest text-swiss-red uppercase">{activity.type.replace('Event', '')}</span>
                        <span className="text-[10px] font-bold opacity-30 uppercase">{formatDistanceToNow(new Date(activity.created_at || Date.now()), { addSuffix: true })}</span>
                      </div>
                      <p className="font-bold uppercase tracking-tight text-lg group-hover:translate-x-2 transition-transform">
                        {activity.repo.name}
                      </p>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center font-bold uppercase opacity-20 py-12">NO_ACTIVITY_LOGGED</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
