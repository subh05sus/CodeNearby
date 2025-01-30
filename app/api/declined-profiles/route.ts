import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/options"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { githubId } = await request.json()
    const client = await clientPromise
    const db = client.db()

    await db.collection("declinedProfiles").insertOne({
      userId: session.user.id,
      githubId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing declined profile:", error)
    return NextResponse.json({ error: "Failed to store declined profile" }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const declinedProfiles = await db.collection("declinedProfiles").find({ userId: session.user.id }).toArray()

    return NextResponse.json(declinedProfiles)
  } catch (error) {
    console.error("Error fetching declined profiles:", error)
    return NextResponse.json({ error: "Failed to fetch declined profiles" }, { status: 500 })
  }
}

