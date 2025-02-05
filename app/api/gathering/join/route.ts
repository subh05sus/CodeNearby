import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uniqueSlug } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const gathering = await db
      .collection("gatherings")
      .findOne({ slug: uniqueSlug });

    if (!gathering) {
      return NextResponse.json(
        { error: "Gathering not found" },
        { status: 404 }
      );
    }

    if (gathering.participants.includes(session.user.id)) {
      return NextResponse.json(
        { error: "User already in gathering" },
        { status: 400 }
      );
    }

    await db
      .collection("gatherings")
      .updateOne(
        { _id: gathering._id },
        { $addToSet: { participants: new ObjectId(session.user.id) } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining gathering:", error);
    return NextResponse.json(
      { error: "Failed to join gathering" },
      { status: 500 }
    );
  }
}
