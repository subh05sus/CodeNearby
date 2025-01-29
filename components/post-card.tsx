/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsUp, ThumbsDown, MessageSquare, MapPin, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { CommentThread } from "./comment-thread"
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
  const { data: session } = useSession() as { data: Session | null };
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
      const updatedPost:any = await onVote(post._id, voteType)
      // Update only the votes and userVotes, keeping other post data intact
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

  return (
    <Card className="mb-4">
      <CardContent>
        <p>{post.content}</p>
        {post.imageUrl && (
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt="Post image"
            width={300}
            height={200}
            className="mt-2 rounded-lg"
          />
        )}
        {post.poll && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">{post.poll.question}</h3>
            {post.poll.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full mb-2 justify-between"
                onClick={() => onVotePoll && onVotePoll(post._id, index)}
              >
                <span>{option}</span>
                <span>{post.poll?.votes[index] || 0} votes</span>
              </Button>
            ))}
          </div>
        )}
        {post.location && (
          <div className="mt-2 flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              Lat: {post.location.lat.toFixed(6)}, Lng: {post.location.lng.toFixed(6)}
            </span>
          </div>
        )}
        {post.schedule && (
          <div className="mt-2 flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(post.schedule).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex items-center w-full">
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("up")}
              className={`p-2 rounded-full hover:bg-primary/10 ${!canVote && "opacity-50 cursor-not-allowed"}`}
              disabled={!canVote || isVoting}
            >
              <ThumbsUp className="h-4 w-4" />
            </motion.button>
            <span className="text-sm">{(post.votes?.up ?? 0) - (post.votes?.down ?? 0)}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("down")}
              className={`p-2 rounded-full hover:bg-primary/10 ${!canVote && "opacity-50 cursor-not-allowed"}`}
              disabled={!canVote || isVoting}
            >
              <ThumbsDown className="h-4 w-4" />
            </motion.button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="ml-4">
            <MessageSquare className="h-4 w-4 mr-1" />
            {(post.comments?.length ?? 0)} Comments
          </Button>
        </div>
        {showComments && (
          <div className="w-full mt-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
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

