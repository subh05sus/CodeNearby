import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { resetDailyTokens, shouldResetDailyTokens } from "@/lib/user-tiers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user data
    let user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if daily tokens need to be reset
    if (user && shouldResetDailyTokens(user as any)) {
      const updatedUser = resetDailyTokens(user as any);

      // Update user in database
      await db.collection("users").updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: {
            "tokenBalance.daily": updatedUser.tokenBalance.daily,
            "tokenBalance.total": updatedUser.tokenBalance.total,
            "usage.today": updatedUser.usage.today,
            lastTokenReset: updatedUser.lastTokenReset,
          },
        }
      );

      // Refresh user data
      user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(session.user.id) });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user tier data
    return NextResponse.json({
      tier: user.tier || "free",
      tokenBalance: {
        daily: user.tokenBalance?.daily || 0,
        purchased: user.tokenBalance?.purchased || 0,
        total: user.tokenBalance?.total || 0,
      },
      usage: {
        today: {
          tokens: user.usage?.today?.tokens || 0,
          requests: user.usage?.today?.requests || 0,
          date:
            user.usage?.today?.date || new Date().toISOString().split("T")[0],
        },
        total: {
          tokens: user.usage?.total?.tokens || 0,
          requests: user.usage?.total?.requests || 0,
        },
      },
      apiKeyCount: user.apiKeyCount || 0,
      maxApiKeys: user.maxApiKeys || 1,
      billing: {
        currency: user.billing?.currency || "USD",
        stripeCustomerId: user.billing?.stripeCustomerId || null,
      },
      features: {
        analytics: user.features?.analytics || true,
        repositorySearch: user.features?.repositorySearch || true,
        prioritySupport: user.features?.prioritySupport || false,
      },
    });
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
