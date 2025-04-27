import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    cookies();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db();
    const currentUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const currentUserId = currentUser.githubId;
    const friendsIds = currentUser.friends.map((id: number) => id);

    const avoidArray = [currentUserId, ...friendsIds];

    const randomUsers = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            githubId: {
              $nin: avoidArray,
            },
          },
        },
        { $sample: { size: 8 } },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            githubUsername: 1,
            githubId: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(randomUsers);
  } catch (error) {
    console.error("Error fetching random users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
