/* eslint-disable @typescript-eslint/no-explicit-any */
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

    if (!connection || !connection.friends) {
      return NextResponse.json([])
    }

    const friends = await db
      .collection("users")
      .find({ _id: { $in: connection.friends } })
      .toArray()

    return NextResponse.json(
      friends.map((friend:any) => ({
        id: friend._id,
        login: friend.login,
        name: friend.name,
        avatar_url: friend.avatar_url,
      })),
    )
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Error fetching friends" }, { status: 500 })
  }
}

