import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import type { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const gathering = await db
      .collection("gatherings")
      .findOne({ slug: params.slug });
    if (!gathering) {
      return NextResponse.json(
        { error: "Gathering not found" },
        { status: 404 }
      );
    }

    const isParticipant = gathering.participants.some(
      (id: ObjectId) => id.toString() === session.user.id
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
