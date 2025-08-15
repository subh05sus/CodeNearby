/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { MasonryGrid } from "@/components/masonry-grid";
import LoginButton from "@/components/login-button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

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

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showGithubEvents, setShowGithubEvents] = useState<boolean>(true);
  const [columns, setColumns] = useState<number>(2);
  const { ref, inView } = useInView();

  useEffect(() => {
    // restore toggle from localStorage
    try {
      const saved = localStorage.getItem("feed:showGithubEvents");
      if (saved !== null) setShowGithubEvents(saved === "1");
      const savedCols = localStorage.getItem("feed:columns");
      if (savedCols) {
        const n = parseInt(savedCols, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= 6) setColumns(n);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  // When toggling, refresh first page quickly by resetting pagination
  useEffect(() => {
    try {
      localStorage.setItem(
        "feed:showGithubEvents",
        showGithubEvents ? "1" : "0"
      );
    } catch {}
    // Reset and refetch from page 1
    setPosts([]);
    setPage(1);
    // Trigger immediate fetch
    loadMorePosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGithubEvents]);

  const loadMorePosts = async (force = false) => {
    if (loading && !force) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/feed?page=${force ? 1 : page}&includeGithub=${
          showGithubEvents ? "1" : "0"
        }`
      );
      const newPosts = await response.json();
      // Dedupe by _id across pages
      setPosts((prevPosts) => {
        let filtered = Array.isArray(newPosts) ? newPosts : [];
        // If toggle hides events, filter them out just in case backend included any
        if (!showGithubEvents) {
          filtered = filtered.filter(
            (p: any) => !String(p._id).startsWith("gh_event_")
          );
        }
        // const filtered = incoming.filter((p: any) => !seen.has(p._id));
        return force ? filtered : [...prevPosts, ...filtered];
      });
      setPage((prevPage) => (force ? 2 : prevPage + 1));
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (
    content: string,
    image: File | null,
    poll?: { question: string; options: string[] },
    location?: { lat: number; lng: number },
    schedule?: Date
  ) => {
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const postData = {
        content,
        imageUrl,
        poll,
        location,
        schedule: schedule?.toISOString(),
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const newPost = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);

      toast.success("Post created successfully");
    } catch {
      toast.error("Failed to create post");
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast.error("You must be logged in to vote");
      return;
    }

    // Ignore votes on GitHub event synthetic items
    if (postId.startsWith("gh_event_")) {
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
    // Ignore comments on GitHub event synthetic items
    if (postId.startsWith("gh_event_")) {
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
      toast.error("You must be logged in to vote");
      return;
    }

    // Ignore poll votes on GitHub event synthetic items
    if (postId.startsWith("gh_event_")) {
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

    // Ignore comment votes on GitHub event synthetic items
    if (postId.startsWith("gh_event_")) {
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-lg text-center">
          You must be logged in to view the feed
        </p>

        <LoginButton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10" />
        <CreatePost onSubmit={handleCreatePost} />
        <div className="flex justify-end items-center gap-2 mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default select-none">
                  <span className="text-sm text-muted-foreground">
                    More personalized mode
                  </span>
                  <Switch
                    checked={showGithubEvents}
                    onCheckedChange={(v) => setShowGithubEvents(!!v)}
                    aria-label="Toggle GitHub events"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Show GitHub received events from people you follow mixed into
                your feed.
              </TooltipContent>
            </Tooltip>
            {/* Column slider */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Columns</span>
              <div className="w-40">
                <Slider
                  min={1}
                  max={4}
                  step={1}
                  value={[columns]}
                  onValueChange={(vals: number[]) => {
                    const n = Math.min(4, Math.max(1, vals[0] ?? columns));
                    setColumns(n);
                    try {
                      localStorage.setItem("feed:columns", String(n));
                    } catch {}
                  }}
                />
              </div>
              <span className="text-sm w-5 text-center">{columns}</span>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="mt-6">
        <MasonryGrid columns={columns}>
          {posts.map((post) => {
            // Scale cards a bit smaller at higher column counts to prevent overflow
            const scaleClass =
              columns >= 6
                ? "scale-[0.9] origin-top-left"
                : columns >= 5
                ? "scale-[0.95] origin-top-left"
                : columns >= 4
                ? "scale-[0.98] origin-top-left"
                : "";
            return (
              <div
                key={post._id}
                className={`${scaleClass} ${columns >= 5 ? "text-sm" : ""}`}
              >
                <PostCard
                  post={post}
                  compactView={columns >= 4}
                  onVote={handleVote}
                  onAddComment={handleAddComment}
                  onVotePoll={handleVotePoll}
                  onCommentVote={handleCommentVote}
                  isGithubEvent={post._id.startsWith("gh_event_")}
                  column={columns}
                />
              </div>
            );
          })}
        </MasonryGrid>
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <div ref={ref} className="h-10" />
    </div>
  );
}
