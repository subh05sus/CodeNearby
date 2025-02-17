/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const developer: any = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Check if request already exists
    const existingRequest = await db.collection("friendRequests").findOne({
      senderId: session.user.id,
      receiverGithubId: developer.id,
      status: "pending",
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Request already sent" },
        { status: 400 }
      );
    }

    // Check if the receiver is in our database
    const receiverUser = await db.collection("users").findOne({
      githubId: developer.id.toString(),
    });

    // Create new request
    const result = await db.collection("friendRequests").insertOne({
      senderId: session.user.id,
      senderGithubId: session.user.githubId,
      senderGithubUsername: session.user.githubUsername,
      receiverGithubId: developer.id,
      receiverGithubUsername: developer.login,
      status: "pending",
      createdAt: new Date(),
      receiver: {
        id: developer.id,
        login: developer.login,
        avatar_url: developer.avatar_url,
        html_url: developer.html_url,
      },
      receiverInCodeNearby: !!receiverUser,
    });

    return NextResponse.json({ id: result.insertedId });
  } catch (error) {
    console.error("Error creating friend request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
