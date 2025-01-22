import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db()

  try {
    const connection = await db.collection("connections").findOne({ userId })

    if (!connection) {
      return NextResponse.json({ sentRequests: [], receivedRequests: [] })
    }

    const sentRequests = await db
      .collection("users")
      .find({ _id: { $in: connection.sentRequests || [] } })
      .toArray()
    const receivedRequests = await db
      .collection("users")
      .find({ _id: { $in: connection.receivedRequests || [] } })
      .toArray()

    return NextResponse.json({
      sentRequests: sentRequests.map((user) => ({ id: user._id, login: user.login })),
      receivedRequests: receivedRequests.map((user) => ({ id: user._id, login: user.login })),
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: "Error fetching requests" }, { status: 500 })
  }
}

