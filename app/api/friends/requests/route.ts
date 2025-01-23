/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "../../auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const requests = await db
      .collection("friendRequests")
      .find({
        $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      })
      .toArray()

      
      console.log("requests", requests)
    // Fetch user details for senders and receivers
    const userIds = Array.from(new Set(requests.map((r) => r.senderId).concat(requests.map((r) => r.receiverId))))
      .filter(id => typeof id === 'string')
      // console.log("userIds", userIds)
    const users = await db
      .collection("users")
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray()
      // console.log("users", users)
    const usersMap = users.reduce<Record<string, any>>((acc, user) => {
      acc[user._id.toString()] = user
      return acc
    }, {})
    // console.log("usersMap", usersMap)
    const enrichedRequests = requests.map((request) => ({
      ...request,
      sender: usersMap[request.senderId],
      receiver: usersMap[request.receiverId],
    }))
    console.log("enrichedRequests", enrichedRequests)
    return NextResponse.json(enrichedRequests)
  } catch (error) {
    console.error("Error fetching friend requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

