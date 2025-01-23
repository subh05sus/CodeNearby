import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const requestId = new ObjectId(params.id)
    const friendRequest = await db.collection("friendRequests").findOne({
      _id: requestId,
      receiverId: session.user.id,
    })

    if (!friendRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await db.collection("friendRequests").updateOne({ _id: requestId }, { $set: { status } })

    if (status === "accepted") {
      // Add users to each other's friends list
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(session.user.id) }, { $addToSet: { friends: friendRequest.senderId } })
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(friendRequest.senderId) }, { $addToSet: { friends: session.user.id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating friend request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

