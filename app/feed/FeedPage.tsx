/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { Loader2, Rss, Github, LayoutGrid } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    try {
      const mq = window.matchMedia("(max-width: 768px)");

      const applyViewport = (matches: boolean) => {
        setIsMobile(matches);
        if (matches) {
          setColumns(1);
        } else {
          const savedCols = localStorage.getItem("feed:columns");
          if (savedCols) {
            const n = parseInt(savedCols, 10);
            if (!Number.isNaN(n) && n >= 1 && n <= 6) setColumns(n);
          }
        }
      };

      applyViewport(mq.matches);

      const saved = localStorage.getItem("feed:showGithubEvents");
      if (saved !== null) setShowGithubEvents(saved === "1");

      const handleChange = (e: MediaQueryListEvent) => applyViewport(e.matches);
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handleChange);
      } else if (typeof mq.addListener === "function") {
        // Safari/older
        mq.addListener(handleChange as any);
      }

      return () => {
        if (typeof mq.removeEventListener === "function") {
          mq.removeEventListener("change", handleChange);
        } else if (typeof mq.removeListener === "function") {
          mq.removeListener(handleChange as any);
        }
      };
    } catch {}
  }, []);

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "feed:showGithubEvents",
        showGithubEvents ? "1" : "0"
      );
    } catch {}
    setPosts([]);
    setPage(1);
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
      setPosts((prevPosts) => {
        let filtered = Array.isArray(newPosts) ? newPosts : [];
        if (!showGithubEvents) {
          filtered = filtered.filter(
            (p: any) => !String(p._id).startsWith("gh_event_")
          );
        }
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] gap-6 px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <Rss className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center max-w-xs">
          <h2 className="font-heading text-xl mb-2">Your developer feed</h2>
          <p className="text-sm text-muted-foreground">Sign in with GitHub to see posts from your network.</p>
        </div>
        <LoginButton />
      </div>
    );
  }

  const effectiveColumns = isMobile ? 1 : columns;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Feed header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(24 95% 53% / 0.12)" }}
            >
              <Rss className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading text-xl">Feed</h1>
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-default select-none">
                    <Github className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground hidden sm:inline">GitHub events</span>
                    <Switch
                      checked={showGithubEvents}
                      onCheckedChange={(v) => setShowGithubEvents(!!v)}
                      aria-label="Toggle GitHub events"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Show GitHub received events from people you follow mixed into your feed.
                </TooltipContent>
              </Tooltip>

              <div className="hidden md:flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="w-28">
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
                <span className="text-xs text-muted-foreground font-mono w-3">{columns}</span>
              </div>
            </div>
          </TooltipProvider>
        </div>

        <CreatePost onSubmit={handleCreatePost} />
      </motion.div>

      <div className="mt-6">
        <MasonryGrid columns={effectiveColumns}>
          {posts.map((post) => {
            const scaleClass =
              effectiveColumns >= 6
                ? "scale-[0.9] origin-top-left"
                : effectiveColumns >= 5
                ? "scale-[0.95] origin-top-left"
                : effectiveColumns >= 4
                ? "scale-[0.98] origin-top-left"
                : "";
            return (
              <div
                key={post._id}
                className={`${scaleClass} ${effectiveColumns >= 5 ? "text-sm" : ""}`}
              >
                <PostCard
                  post={post}
                  compactView={effectiveColumns >= 4}
                  onVote={handleVote}
                  onAddComment={handleAddComment}
                  onVotePoll={handleVotePoll}
                  onCommentVote={handleCommentVote}
                  isGithubEvent={post._id.startsWith("gh_event_")}
                  column={effectiveColumns}
                />
              </div>
            );
          })}
        </MasonryGrid>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Loading posts...</span>
          </div>
        </div>
      )}

      <div ref={ref} className="h-10" />
    </div>
  );
}
