import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const friendId = searchParams.get("friendId")

  if (!userId || !friendId) {
    return NextResponse.json({ error: "Missing userId or friendId" }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db()

  try {
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Error fetching messages" }, { status: 500 })
  }
}

