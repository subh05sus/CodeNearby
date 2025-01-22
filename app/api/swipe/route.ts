import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request: Request) {
  const { userId, targetId, direction } = await request.json()

  if (!userId || !targetId || !direction) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db()

  try {
    if (direction === "right") {
      await db
        .collection("connections")
        .updateOne({ userId }, { $addToSet: { sentRequests: targetId } }, { upsert: true })

      await db
        .collection("connections")
        .updateOne({ userId: targetId }, { $addToSet: { receivedRequests: userId } }, { upsert: true })

      // Check if both users have swiped right on each other
      const targetConnection = await db.collection("connections").findOne({ userId: targetId })
      if (targetConnection && targetConnection.sentRequests && targetConnection.sentRequests.includes(userId)) {
        // Create a friendship
        await db
          .collection("connections")
          .updateOne(
            { userId },
            { $addToSet: { friends: targetId }, $pull: { sentRequests: targetId, receivedRequests: targetId } },
          )
        await db
          .collection("connections")
          .updateOne(
            { userId: targetId },
            { $addToSet: { friends: userId }, $pull: { sentRequests: userId, receivedRequests: userId } },
          )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling swipe:", error)
    return NextResponse.json({ error: "Error handling swipe" }, { status: 500 })
  }
}

