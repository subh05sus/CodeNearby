/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const gatherings = await db
      .collection("gatherings")
      .find({ participants: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(gatherings);
  } catch (error) {
    console.error("Error fetching gatherings:", error);
    return NextResponse.json(
      { error: "Failed to fetch gatherings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, expiration } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const slug = nanoid(10);
    const expiresAt = new Date(
      Date.now() + Number.parseInt(expiration) * 60 * 60 * 1000
    );

    const gathering = {
      name,
      slug,
      hostId: new ObjectId(session.user.id),
      participants: [new ObjectId(session.user.id)],
      createdAt: new Date(),
      expiresAt,
    };

    const result = await db.collection("gatherings").insertOne(gathering);

    return NextResponse.json({ id: result.insertedId, slug });
  } catch (error) {
    console.error("Error creating gathering:", error);
    return NextResponse.json(
      { error: "Failed to create gathering" },
      { status: 500 }
    );
  }
}
