import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const friendIds = user.friends || []
    const friends = await db
      .collection("users")
      .find(
        { githubId: { $in: friendIds } },
        { projection: { _id: 0, githubId: 1, name: 1, githubUsername: 1, avatar_url: 1 } },
      )
      .toArray()

    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

