import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import {
  UserRecord,
  shouldResetDailyTokens,
  resetDailyTokens,
} from "@/lib/user-tiers";

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
    let user = (await usersCollection.findOne({
      _id: session.user.id,
    })) as UserRecord | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if daily tokens need to be reset
    if (shouldResetDailyTokens(user)) {
      const updatedUser = resetDailyTokens(user);

      await usersCollection.updateOne(
        { _id: session.user.id },
        {
          $set: {
            tokenBalance: updatedUser.tokenBalance,
            usage: updatedUser.usage,
            lastTokenReset: updatedUser.lastTokenReset,
          },
        }
      );

      user = updatedUser;
    }

    // Return user tier information
    const response = {
      userId: user._id,
      tier: user.tier,
      tokenBalance: user.tokenBalance,
      usage: user.usage,
      apiKeyCount: user.apiKeyCount,
      maxApiKeys: user.maxApiKeys,
      features: user.features,
      billing: {
        currency: user.billing.currency,
        totalSpent: user.billing.totalSpent,
      },
      verification: user.verification,
      lastTokenReset: user.lastTokenReset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
