import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId } = await request.json()
    const client = await clientPromise
    const db = client.db()

    // Check if request already exists
    const existingRequest = await db.collection("friendRequests").findOne({
      senderId: session.user.id,
      receiverId,
      status: "pending",
    })

    if (existingRequest) {
      return NextResponse.json({ error: "Request already sent" }, { status: 400 })
    }

    // Create new request
    const result = await db.collection("friendRequests").insertOne({
      senderId: session.user.id,
      receiverId,
      status: "pending",
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Error creating friend request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

