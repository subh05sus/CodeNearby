/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { authOptions } from "@/app/options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.githubId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const requests = await db
      .collection("friendRequests")
      .find({
        $or: [{ senderId: session.user.id }, { receiverGithubId: Number.parseInt(session.user.githubId) }],
      })
      .toArray()

    // Fetch user details for senders and receivers
    const userIds = requests.map((r) => r.senderId).filter((id) => id !== session.user.id)
    const githubIds = requests.map((r) => r.senderGithubId).concat(requests.map((r) => r.receiverGithubId))
    const users = await db
      .collection("users")
      .find({
        $or: [{ _id: { $in: userIds.map((id) => new ObjectId(id)) } }, { githubId: { $in: githubIds } }],
      })
      .toArray()

    const usersMap = users.reduce<{ [key: string]: any }>((acc, user) => {
      acc[user._id.toString()] = user
      acc[user.githubId.toString()] = user
      return acc
    }, {})
    const enrichedRequests = requests.map((request) => {
      const isSender = request.senderId === session.user.id
      const otherUser = isSender ? usersMap[request.receiverGithubId.toString()] : usersMap[request.senderId]

      return {
        ...request,
        otherUser: otherUser || {
          id: isSender ? request.receiverGithubId : request.senderGithubId,
          login: isSender ? request.receiverGithubUsername : request.senderGithubUsername,
          avatar_url: request.receiver?.avatar_url,
          html_url: request.receiver?.html_url,
        },
        otherUserInCodeNearby: !!otherUser,
      }
    })
    return NextResponse.json(enrichedRequests)
  } catch (error) {
    console.error("Error fetching friend requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

