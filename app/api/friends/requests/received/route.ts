/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/options";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    cookies();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.githubId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch only received friend requests
    const requests = await db
      .collection("friendRequests")
      .find({ receiverGithubId: Number.parseInt(session.user.githubId) })
      .toArray();

    if (requests.length === 0) {
      return NextResponse.json([]);
    }

    // Extract unique sender IDs
    const senderIds = [...requests.map((r) => r.senderId).filter(Boolean)].map(
      (id) => new ObjectId(id)
    );

    // Fetch sender details from users collection
    const users = await db
      .collection("users")
      .find({ _id: { $in: senderIds } })
      .project({
        _id: 1,
        githubUsername: 1,
        name: 1,
        githubId: 1,
        image: 1,
      }) // Fetch only necessary fields
      .toArray();

    // Create a sender lookup map
    const usersMap = Object.fromEntries(
      users.map((user) => [user._id.toString(), user])
    );

    // Enrich requests with sender details
    const enrichedRequests = requests.map((request) => ({
      ...request,
      sender: usersMap[request.senderId] || {
        id: request.senderId,
        login: request.senderGithubUsername || "Unknown",
      },
    }));

    return NextResponse.json(enrichedRequests);
  } catch (error) {
    console.error("Error fetching received friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch received requests" },
      { status: 500 }
    );
  }
}
