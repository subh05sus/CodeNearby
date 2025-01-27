/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "../../auth/[...nextauth]/route"

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
        $or: [{ senderId: session.user.id }, { receiverGithubId: session.user.githubId }],
      })
      .toArray()

    // Fetch user details for senders and receivers
    const githubIds = Array.from(
      new Set(requests.map((r) => r.senderGithubId).concat(requests.map((r) => r.receiverGithubId))),
    )
    const users = await db
      .collection("users")
      .find({ githubId: { $in: githubIds } })
      .toArray()

    const usersMap = users.reduce<{ [key: string]: any }>((acc, user) => {
      acc[user.githubId] = user
      return acc
    }, {})

    const enrichedRequests = requests.map((request) => ({
      ...request,
      sender: request.senderId === session.user.id ? null : usersMap[request.senderGithubId],
      receiver: usersMap[request.receiverGithubId] || {
        id: request.receiverGithubId,
        login: request.receiverGithubUsername,
        avatar_url: request.receiver?.avatar_url,
        html_url: request.receiver?.html_url,
      },
      receiverInCodeNearby: !!usersMap[request.receiverGithubId],
    }))

    return NextResponse.json(enrichedRequests)
  } catch (error) {
    console.error("Error fetching friend requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

