import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    const users = db.collection("users");

    const user = await users.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user tier information
    const tierData = {
      tier: user.tier || "free",
      usage: user.usage || {
        apiRequests: 0,
        apiKeys: 0,
        resetDate: new Date(),
      },
      billingInfo: user.billingInfo || {
        customerId: null,
        subscriptionId: null,
        status: "inactive",
      },
      preferences: user.preferences || {
        notifications: true,
        emailUpdates: false,
      },
      tokenBalance: user.tokenBalance || {
        total: 0,
        purchased: 0,
        daily: 0,
        lastDailyReset: new Date(),
      },
    };

    return NextResponse.json(tierData);
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
