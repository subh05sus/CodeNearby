/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendId = Number.parseInt(params.id);
    if (isNaN(friendId)) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    const userGithubId = Number.parseInt(session.user.githubId);

    const client = await clientPromise;
    const db = client.db();

    // Remove friend from user's friends list
    await db.collection("users").updateOne(
      { githubId: userGithubId },
      {
        $set: {
          friends: {
            $filter: {
              input: "$friends",
              cond: { $ne: ["$$this", friendId] },
            },
          },
        },
      }
    );

    // Remove user from friend's friends list
    await db.collection("users").updateOne(
      { githubId: friendId },
      {
        $set: {
          friends: {
            $filter: {
              input: "$friends",
              cond: { $ne: ["$$this", userGithubId] },
            },
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}

// create friend post
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendId = Number.parseInt(params.id);
    if (isNaN(friendId)) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
    }

    const userGithubId = Number.parseInt(session.user.githubId);

    const client = await clientPromise;
    const db = client.db();

    // Add friend to user's friends list
    await db
      .collection("users")
      .updateOne(
        { githubId: userGithubId },
        { $addToSet: { friends: friendId } }
      );

    // Add user to friend's friends list
    await db
      .collection("users")
      .updateOne(
        { githubId: friendId },
        { $addToSet: { friends: userGithubId } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding friend:", error);
    return NextResponse.json(
      { error: "Failed to add friend" },
      { status: 500 }
    );
  }
}
