"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, ChevronUp, MessageSquare, Award, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Session } from "next-auth"

interface Comment {
  _id: string
  userId: string
  content: string
  createdAt: string
  votes: { up: number; down: number }
  userVotes: Record<string, number>
  replies: Comment[]
  user?: {
    name: string
    image: string
  }
}

interface CommentThreadProps {
  comment: Comment
  postId: string
  depth?: number
  onVote: (commentId: string, voteType: "up" | "down") => Promise<void>
  onReply: (postId: string, content: string, parentCommentId: string) => Promise<void>
}

export function CommentThread({ comment, postId, depth = 0, onVote, onReply }: CommentThreadProps) {
    const { data: session } = useSession() as { data: Session | null };
    const [isCollapsed, setIsCollapsed] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isVoting, setIsVoting] = useState(false)

  const userVoteCount = (comment.userVotes ?? {})[session?.user?.id || ""] || 0
  const canVote = userVoteCount < 50

  const handleVote = async (voteType: "up" | "down") => {
    if (!canVote || isVoting) return
    setIsVoting(true)
    try {
      await onVote(comment._id, voteType)
    } finally {
      setIsVoting(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    try {
      await onReply(postId, replyContent, comment._id)
      // Keep the comment data intact, just clear the reply input and hide the reply form
      setReplyContent("")
      setIsReplying(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        {depth > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-border -ml-4" />}
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={comment.user?.image} />
              <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{comment.user?.name}</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="pl-8">
            <p className="text-sm mb-2">{comment.content}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleVote("up")}
                  className="text-muted-foreground hover:text-primary"
                  disabled={!canVote || isVoting}
                >
                  <ChevronUp className="h-4 w-4" />
                </motion.button>
                <span className="mx-1 text-sm">{comment.votes.up - comment.votes.down}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleVote("down")}
                  className="text-muted-foreground hover:text-primary"
                  disabled={!canVote || isVoting}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Award className="h-4 w-4 mr-1" />
                Award
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
  )
}

