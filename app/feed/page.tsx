"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"

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

interface Poll {
  question: string
  options: string[]
  votes: Record<string, number>
}

export default function FeedPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      loadMorePosts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  const loadMorePosts = async () => {
    if (loading) return
    setLoading(true)
    try {
      const response = await fetch(`/api/posts?page=${page}`)
      const newPosts = await response.json()
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setPage((prevPage) => prevPage + 1)
    } catch  {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (
    content: string,
    image: File | null,
    poll?: { question: string; options: string[] },
    location?: { lat: number; lng: number },
    schedule?: Date,
  ) => {
    try {
      let imageUrl = ""
      if (image) {
        const formData = new FormData()
        formData.append("file", image)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.imageUrl
      }

      const postData = {
        content,
        imageUrl,
        poll,
        location,
        schedule: schedule?.toISOString(),
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        throw new Error("Failed to create post")
      }

      const newPost = await response.json()
      setPosts((prevPosts) => [newPost, ...prevPosts])

      toast({
        title: "Success",
        description: "Post created successfully",
      })
    } catch  {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote")
      }

      const updatedPost = await response.json()
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, votes: updatedPost.votes, userVotes: updatedPost.userVotes }
          }
          return post
        }),
      )
    } catch  {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const updatedPost = await response.json()
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return updatedPost
          }
          return post
        }),
      )

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch  {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>

      <CreatePost onSubmit={handleCreatePost} />

      <div className="mt-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onVote={handleVote} onAddComment={handleAddComment} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <div ref={ref} className="h-10" />
    </div>
  )
}

