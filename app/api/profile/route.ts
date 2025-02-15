/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendRequests = await db
      .collection("friendRequests")
      .find({
        $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      })
      .toArray();

    const friendIds = Array.isArray(user.friends) ? user.friends : []; // Ensure it's an array
    const friends = await db
      .collection("users")
      .find({ githubId: { $in: friendIds.length > 0 ? friendIds : [] } }) // Prevent $in from failing
      .project({
        githubId: 1,
        githubUsername: 1,
        image: 1,
        name: 1,
        githubBio: 1,
        githubLocation: 1,
      })
      .toArray();

    const profile = {
      ...user,
      friends: friends.map((friend: any) => ({
        githubId: friend.githubId,
        githubUsername: friend.githubUsername,
        image: friend.image,
        name: friend.name,
        githubBio: friend.githubBio,
        githubLocation: friend.githubLocation,
      })),
      sentRequests: friendRequests
        .filter((req) => req.senderId === session.user.id)
        .map((req) => req.receiverId),
      receivedRequests: friendRequests
        .filter((req) => req.receiverId === session.user.id)
        .map((req) => req.senderId),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
