import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
      .aggregate([
        { $match: { slug: params.slug } },
        {
          $lookup: {
            from: "users",
            localField: "hostId",
            foreignField: "_id",
            as: "host",
          },
        },
        { $unwind: "$host" },
      ])
      .next();

    if (!gathering) {
      return NextResponse.json(
        { error: "Gathering not found" },
        { status: 404 }
      );
    }

    const participants = await db
      .collection("users")
      .find({
        _id: {
          $in: gathering.participants.map((id: string) => new ObjectId(id)),
        },
      })
      .project({ _id: 1, name: 1, image: 1, githubUsername: 1 })
      .toArray();

    return NextResponse.json({
      ...gathering,
      participants,
    });
  } catch (error) {
    console.error("Error fetching gathering:", error);
    return NextResponse.json(
      { error: "Failed to fetch gathering" },
      { status: 500 }
    );
  }
}
