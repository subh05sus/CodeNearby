/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useParams } from "next/navigation";

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

export default function FeedPage() {
  const { id } = useParams();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const { toast } = useToast();

  const fetchPost = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${id}`);
      const data = await response.json();
      setPost(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const postId = Array.isArray(id) ? id[0] : id;
    fetchPost(postId);
  }, [id]);

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
      setPost((prevPost) => {
        if (!prevPost || prevPost._id !== postId) return prevPost;
        return {
          ...prevPost,
          votes: updatedPost.votes,
          userVotes: updatedPost.userVotes,
        };
      });
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
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        if (prevPost._id === postId) {
          const addComment = (comments: Comment[], newComment: Comment, parentId?: string): Comment[] => {
        if (!parentId) {
          return [...comments, newComment];
        }

        return comments.map(comment => {
          if (comment._id === parentId) {
            return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
          ...comment,
          replies: addComment(comment.replies, newComment, parentId)
            };
          }
          return comment;
        });
          };

          return {
        ...prevPost,
        comments: addComment(prevPost.comments, newComment, parentCommentId)
          };
        }
        return prevPost;
      });

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
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        if (prevPost._id === postId) {
          return { ...prevPost, poll: updatedPost.poll };
        }
        return prevPost;
      });
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
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        if (prevPost._id === postId) {
          const updateCommentVotes = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            return {
          ...comment,
          votes: updatedComment.votes,
          userVotes: updatedComment.userVotes,
            };
          }
          if (comment.replies?.length > 0) {
            return {
          ...comment,
          replies: updateCommentVotes(comment.replies),
            };
          }
          return comment;
        });
          };

          return {
        ...prevPost,
        comments: updateCommentVotes(prevPost.comments),
          };
        }
        return prevPost;
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote on comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {loading ? (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div>
          {post ? (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVote}
              onAddComment={handleAddComment}
              onVotePoll={handleVotePoll}
              onCommentVote={handleCommentVote}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
