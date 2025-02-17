"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, MessageSquare, ChevronRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Session } from "next-auth";
import { toast } from "sonner";

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

interface CommentThreadProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onVote: (commentId: string, voteType: "up" | "down") => Promise<void>;
  onReply: (
    postId: string,
    content: string,
    parentCommentId: string
  ) => Promise<void>;
}

export function CommentThread({
  comment,
  postId,
  depth = 0,
  onVote,
  onReply,
}: CommentThreadProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const userVoteCount = (comment.userVotes ?? {})[session?.user?.id || ""] || 0;
  const canVote = userVoteCount < 1;

  const handleVote = async (voteType: "up" | "down") => {
    if (!canVote || isVoting) return;
    setIsVoting(true);
    try {
      await onVote(comment._id, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      await onReply(postId, replyContent, comment._id);
      // Update the reply key to force re-render
      setReplyContent("");
      setIsReplying(false);
    } catch {
      toast.error("Error", { description: "Failed to add reply" });
    }
  };

  return (
    <div className="relative mb-4 overflow-x-scroll no-scrollbar">
      <div className="flex gap-2">
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border -ml-4" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={comment.user?.image} />
              <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-nowrap">
              {comment.user?.name}
            </span>
            <span className="text-muted-foreground text-sm text-nowrap">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="pl-8">
            <p className="text-sm mb-2 ">{comment.content}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  asChild
                  variant={"secondary"}
                  size="sm"
                  disabled={canVote || isVoting}
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleVote("up")}
                    className="text-muted-foreground hover:text-primary"
                    disabled={!canVote || isVoting}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="mx-1 text-sm">
                      {comment.votes.up - comment.votes.down}
                    </span>
                  </motion.button>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
            {isReplying && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1"
                />
                <Button onClick={handleReply}>Reply</Button>
              </div>
            )}
          </div>
          {!isCollapsed && comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-4">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  onVote={onVote}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
