/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, Share2, Twitter } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { CommentThread } from "./comment-thread"
import { LocationPreview } from "./location-preview"
import { PollDisplay } from "./poll-display"
import type { Session } from "next-auth"
import { format, formatDistanceToNow } from "date-fns"
import { EmojiPicker } from "./emoji-picker"
import {FaWhatsapp} from "react-icons/fa";

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

interface Post {
  _id: string
  userId: string
  content: string
  imageUrl?: string
  createdAt: string
  votes: { up: number; down: number }
  userVotes: Record<string, number>
  comments: Comment[]
  poll?: Poll
  location?: { lat: number; lng: number }
  schedule?: string
}

interface Poll {
  question: string
  options: string[]
  votes: Record<string, number>
}

interface PostCardProps {
  post: Post
  onVote: (postId: string, voteType: "up" | "down") => Promise<void>
  onAddComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>
  onVotePoll?: (postId: string, optionIndex: number) => Promise<void>
}

export function PostCard({ post, onVote, onAddComment, onVotePoll }: PostCardProps) {
  const { data: session } = useSession() as { data: Session | null }
  const [commentContent, setCommentContent] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()

  const userVoteCount = (post.userVotes ?? {})[session?.user?.id || ""] || 0
  const canVote = userVoteCount < 50

  const handleVote = async (voteType: "up" | "down") => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      })
      return
    }

    if (!canVote || isVoting) return

    setIsVoting(true)
    try {
      const updatedPost: any = await onVote(post._id, voteType)
      post.votes = updatedPost?.votes || post.votes
      post.userVotes = updatedPost?.userVotes || post.userVotes
    } finally {
      setIsVoting(false)
    }
  }

  const handleAddComment = async (parentCommentId?: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      })
      return
    }

    if (!commentContent.trim()) return

    try {
      await onAddComment(post._id, commentContent, parentCommentId)
      setCommentContent("")
      setShowComments(true)
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const addToCalendar = () => {
    if (!post.schedule) return
    const date = new Date(post.schedule)
    const encodedText = encodeURIComponent(post.content)
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedText}&dates=${
      date.toISOString().replace(/[-:]/g, "").split(".")[0]
    }Z/${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
    window.open(googleCalendarUrl, "_blank")
  }

  const sharePost = async () => {
    try {
      await navigator.share({
        title: "Check out this post",
        text: post.content,
        url: `${window.location.origin}/posts/${post._id}`,
      })
    } catch (error) {
      console.log("Error sharing:", error)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setCommentContent((prev) => prev + emoji)
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.content)
    const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(post.content)
    const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`)
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Post Content */}
            <p className="text-lg">
            {post.content.split(/\b(https?:\/\/\S+)/g).map((part, i) => (
              part.match(/^https?:\/\//) ? (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {part}
              </a>
              ) : part
            ))}
            </p>

          {/* Image */}
          {post.imageUrl && (
            <Image
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg w-full object-cover"
            />
          )}

          {/* Poll */}
          {post.poll && (
            <div className="mt-4">
              <PollDisplay poll={post.poll} postId={post._id} onVote={onVotePoll!} />
            </div>
          )}

          {/* Location */}
          {post.location && (
            <div className="mt-4">
              <LocationPreview lat={post.location.lat} lng={post.location.lng} />
            </div>
          )}

          {/* Schedule */}
          {post.schedule && (
            <div className="mt-4 flex items-center justify-between bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-medium">{format(new Date(post.schedule), "PPPP")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(post.schedule), "p")}</p>
                </div>
              </div>
              <Button onClick={addToCalendar} size="sm" className="rounded-full">
                Add to Calendar
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col border-t">
        <div className="flex items-center justify-between w-full py-2">
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("up")}
              className={`p-2 rounded-full hover:bg-primary/10 ${!canVote && "opacity-50 cursor-not-allowed"}`}
              disabled={!canVote || isVoting}
            >
              <ThumbsUp className="h-4 w-4" />
            </motion.button>
            <span className="text-sm font-medium">{(post.votes?.up ?? 0) - (post.votes?.down ?? 0)}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("down")}
              className={`p-2 rounded-full hover:bg-primary/10 ${!canVote && "opacity-50 cursor-not-allowed"}`}
              disabled={!canVote || isVoting}
            >
              <ThumbsDown className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
             {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {post.comments?.length ?? 0} Comments
            </Button>
            <Button variant="ghost"  size="sm" onClick={shareOnTwitter}>
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost"  size="sm" onClick={shareOnWhatsApp}>
              <FaWhatsapp className="h-4 w-4" />
            </Button>
            <Button variant="ghost"  size="sm" onClick={sharePost}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <EmojiPicker onChange={handleEmojiSelect} />
              </div>
              <Button onClick={() => handleAddComment()}>Comment</Button>
            </div>
            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onVote={onVote}
                  onReply={onAddComment}
                />
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

