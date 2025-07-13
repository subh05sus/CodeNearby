import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { canUserCreateApiKey } from "@/lib/user-tiers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("test");

    // Get user with tier information
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can create API key
    const canCreate = await canUserCreateApiKey(user._id.toString());

    // Get current API key count
    const apiKeys = await db
      .collection("apiKeys")
      .find({ userId: user._id })
      .toArray();
    const currentCount = apiKeys.length;

    // Get tier limits
    const tierLimits = {
      free: { maxApiKeys: 1 },
      starter: { maxApiKeys: 3 },
      developer: { maxApiKeys: 10 },
      business: { maxApiKeys: 50 },
      enterprise: { maxApiKeys: -1 }, // unlimited
    };

    const userTier = user.tier || "free";
    const maxKeys =
      tierLimits[userTier as keyof typeof tierLimits]?.maxApiKeys || 1;

    return NextResponse.json({
      canCreate,
      current: currentCount,
      max: maxKeys === -1 ? "unlimited" : maxKeys,
      tier: userTier,
    });
  } catch (error) {
    console.error("Error checking API key permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
