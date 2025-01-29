import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/options"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    console.log("Fetching messages for user:", session.user.githubId, "and", params.id)
    const messages = await db.collection("messages").find({
      $or: [
        { senderId: String(session.user.githubId), receiverId: params.id },
        { senderId: params.id, receiverId: String(session.user.githubId) }
      ]
    }).sort({ timestamp: 1 }).toArray()
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
