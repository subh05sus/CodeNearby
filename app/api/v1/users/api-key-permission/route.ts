import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { canCreateApiKey, UserRecord } from "@/lib/user-tiers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Find user by session ID
    const user = (await usersCollection.findOne({
      _id: session.user.id,
    })) as UserRecord | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can create more API keys
    const permission = canCreateApiKey(user);

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error checking API key permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
