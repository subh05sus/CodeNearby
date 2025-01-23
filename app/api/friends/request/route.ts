import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("session", session)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const developerData = await request.json()
    console.log(developerData)
    const client = await clientPromise
    const db = client.db()

    // Check if request already exists
    const existingRequest = await db.collection("friendRequests").findOne({
      senderId: session.user.id,
      receiverId:developerData.id,
      receiverGithubUrl: developerData.html_url,
      receiverAvatar: developerData.avatar_url,
      status: "pending",
    })

    if (existingRequest) {
      return NextResponse.json({ error: "Request already sent" }, { status: 400 })
    }

    // Create new request
    const result = await db.collection("friendRequests").insertOne({
      senderId: session.user.id,
      receiverId:developerData.id,
      receiverGithubUrl: developerData.html_url,
      receiverAvatar: developerData.avatar_url,
      status: "pending",
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Error creating friend request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

