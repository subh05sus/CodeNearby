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
    const { optionIndex } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const postId = new ObjectId(params.id)
    const userId = session.user.id

    // Get current post
    const post = await db.collection("posts").findOne({ _id: postId })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has already voted
    const userVoteKey = `poll.userVotes.${userId}`
    const hasVoted = post.poll?.userVotes?.[userId] !== undefined

    if (hasVoted) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 })
    }

    // Update poll votes
    const updateResult = await db.collection("posts").findOneAndUpdate(
      { _id: postId },
      {
        $inc: { [`poll.votes.${optionIndex}`]: 1 },
        $set: { [userVoteKey]: optionIndex },
      },
      { returnDocument: "after" },
    )

    if (!updateResult) {
      return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
    }

    return NextResponse.json(updateResult)
  } catch (error) {
    console.error("Error voting on poll:", error)
    return NextResponse.json({ error: "Failed to vote on poll" }, { status: 500 })
  }
}

