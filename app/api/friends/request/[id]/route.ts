import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/options"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const requestId = new ObjectId(params.id)
    const friendRequest = await db.collection("friendRequests").findOne({
      _id: requestId,
      receiverGithubId: Number.parseInt(session.user.githubId),
    })

    if (!friendRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await db.collection("friendRequests").updateOne({ _id: requestId }, { $set: { status } })

    if (status === "accepted") {
      // Add users to each other's friends list
      await db
        .collection("users")
        .updateOne(
          { githubId: Number.parseInt(session.user.githubId) },
          { $addToSet: { friends: friendRequest.senderGithubId } },
        )
      await db
        .collection("users")
        .updateOne(
          { githubId: friendRequest.senderGithubId },
          { $addToSet: { friends: Number.parseInt(session.user.githubId) } },
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating friend request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

