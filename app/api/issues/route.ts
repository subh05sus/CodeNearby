import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, imageUrls, userId } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("issues").insertOne({
      title,
      description,
      imageUrls,
      userId,
      createdAt: new Date(),
      status: "open",
    });

    return NextResponse.json(
      { success: true, issueId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const issues = await db
      .collection("issues")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
