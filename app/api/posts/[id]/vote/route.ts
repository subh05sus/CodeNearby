import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { authOptions } from "@/app/options"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { voteType } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const postId = new ObjectId(params.id)
    const userId = session.user.id

    // Get current post
    const post = await db.collection("posts").findOne({ _id: postId })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check user's vote count
    const postUserVotes = post.userVotes || {}
    const currentVoteCount = postUserVotes[userId] || 0

    if (currentVoteCount >= 50) {
      return NextResponse.json({ error: "Maximum vote limit reached" }, { status: 400 })
    }

    // Update vote counts
    const updateResult = await db.collection("posts").findOneAndUpdate(
      { _id: postId },
      {
        $inc: { [`votes.${voteType}`]: 1 },
        $set: { [`userVotes.${userId}`]: currentVoteCount + 1 },
      },
      { returnDocument: "after" },
    )
    if (!updateResult) {
        return NextResponse.json({ error: "Failed to update vote" }, { status: 500 })
    }
    
    // Return only serializable data
    const { _id, votes, userVotes } = updateResult
    return NextResponse.json({ _id, votes, userVotes })
  } catch (error) {
    console.error("Error voting on post:", error)
    return NextResponse.json({ error: "Failed to vote on post" }, { status: 500 })
  }
}

