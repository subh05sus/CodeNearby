/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { MasonryGrid } from "@/components/masonry-grid";
import LoginButton from "@/components/login-button";
import { toast } from "sonner";
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
    // restore toggle from localStorage
    try {
      // Detect mobile viewport and lock columns to 1 on small devices
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

      // initial run
      applyViewport(mq.matches);

      // restore toggle
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
    } catch { }
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
    } catch { }
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
        `/api/feed?page=${force ? 1 : page}&includeGithub=${showGithubEvents ? "1" : "0"
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] p-8">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none text-black dark:text-white">
            ACCESS<br />DENIED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">
            AUTHORIZATION REQUIRED TO VIEW FEED
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  const effectiveColumns = isMobile ? 1 : columns;

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      {/* Swiss Header */}
      <div className="border-b-8 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-black text-8xl uppercase tracking-tighter leading-[0.8] mb-2 text-black dark:text-white">
              THE<br />FEED
            </h1>
            <p className="font-bold uppercase tracking-[0.2em] text-xs text-swiss-red">
              CORE / REALTIME_CONNECTIVITY / V_2.0
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Columns Control */}
            <div className="flex items-center gap-4">
              <span className="font-black uppercase  text-[10px] text-black dark:text-white">COLUMNS / {columns}</span>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={columns}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setColumns(n);
                  localStorage.setItem("feed:columns", String(n));
                }}
                className="appearance-none w-32 h-6 bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white cursor-pointer accent-black dark:accent-white"
              />
            </div>

            {/* GitHub Toggle */}
            <button
              onClick={() => setShowGithubEvents(!showGithubEvents)}
              className={cn(
                "h-12 px-6 border-4 border-black dark:border-white font-black uppercase tracking-tighter text-sm transition-all flex items-center gap-3",
                showGithubEvents ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
              )}
            >
              <div className={cn(
                "w-4 h-4 border-2 border-current transition-colors",
                showGithubEvents ? "bg-swiss-red border-swiss-red" : "bg-transparent"
              )} />
              GITHUB_SYNDICATION
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <CreatePost onSubmit={handleCreatePost} />
        </div>

        <div className="relative">
          {/* Visual Grid Lines - Optional aesthetic touch */}
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pointer-events-none opacity-5 divide-x-2 divide-black dark:divide-white" />

          <MasonryGrid columns={effectiveColumns} className="relative z-10">
            {posts.map((post) => (
              <div key={post._id} className="mb-8">
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
            ))}
          </MasonryGrid>
        </div>

        {loading && (
          <div className="flex justify-center my-12">
            <div className="h-12 w-12 border-8 border-gray-100 dark:border-gray-900 border-t-swiss-red animate-spin" />
          </div>
        )}

        <div ref={ref} className="h-20" />
      </div>
    </div>
  );
}
