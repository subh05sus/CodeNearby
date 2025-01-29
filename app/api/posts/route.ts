import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { authOptions } from "@/app/options"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = 10
  const skip = (page - 1) * limit

  try {
    const client = await clientPromise
    const db = client.db()

    const posts = await db.collection("posts").find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content, imageUrl } = await request.json()
    const client = await clientPromise
    const db = client.db()

    const post = {
      userId: new ObjectId(session.user.id),
      content,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: { up: 0, down: 0 },
      userVotes: {},
      comments: [],
    }

    const result = await db.collection("posts").insertOne(post)

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

