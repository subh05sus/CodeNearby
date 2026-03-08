"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare, Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Session } from "next-auth";
import { toast } from "sonner";
import SwissButton from "./swiss/SwissButton";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      setReplyContent("");
      setIsReplying(false);
    } catch {
      toast.error("Error", { description: "Failed to add reply" });
    }
  };

  return (
    <div className={cn(
      "relative transition-all duration-300",
      depth > 0 ? "mt-4 ml-6 border-l-4 border-swiss-black pl-6" : ""
    )}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 border-2 border-swiss-black bg-swiss-muted overflow-hidden">
              {comment.user?.image ? (
                <Image src={comment.user.image} alt={comment.user.name || "User"} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-swiss-black text-swiss-white font-black text-[10px] uppercase">
                  {(comment.user?.name || "U").charAt(0)}
                </div>
              )}
            </div>
            <div>
              <span className="font-black uppercase tracking-tighter text-xs leading-none block">
                {comment.user?.name || "Anonymous"}
              </span>
              <span className="text-[8px] font-bold uppercase  text-swiss-red flex items-center gap-1 mt-0.5">
                <Clock className="h-2 w-2" />
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 flex items-center justify-center border-2 border-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-colors"
          >
            {isCollapsed ? <Plus className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Content Body */}
        {!isCollapsed && (
          <>
            <div className="bg-swiss-white border-2 border-swiss-black p-4 font-bold uppercase tracking-tight text-sm leading-tight">
              {comment.content}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border-2 border-swiss-black divide-x-2 divide-swiss-black">
                <button
                  onClick={() => handleVote("up")}
                  disabled={!canVote || isVoting}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center transition-colors hover:bg-swiss-black hover:text-swiss-white",
                    !canVote && "opacity-20 grayscale"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="px-3 h-10 flex items-center justify-center bg-swiss-muted font-black text-sm">
                  {comment.votes.up - comment.votes.down}
                </div>
              </div>

              <SwissButton
                variant="secondary"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-10 px-4"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                REPLY
              </SwissButton>
            </div>

            {isReplying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="ADD REPLY..."
                  className="flex-1 bg-swiss-white border-4 border-swiss-black p-3 font-bold uppercase tracking-tight focus:bg-swiss-muted transition-colors outline-none text-sm"
                />
                <SwissButton onClick={handleReply} variant="primary">SEND</SwissButton>
              </motion.div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4">
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
          </>
        )}
      </div>
    </div>
  );
}
