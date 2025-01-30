import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = 10
  const skip = (page - 1) * limit

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const posts = await db
      .collection("posts")
      .find({ $text: { $search: query } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error searching posts:", error)
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 })
  }
}
