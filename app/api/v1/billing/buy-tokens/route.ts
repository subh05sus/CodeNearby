import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import {
  UserRecord,
  getTokenPackage,
  addPurchasedTokens,
} from "@/lib/user-tiers";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId, currency } = await request.json();

    if (!packageId || !currency) {
      return NextResponse.json(
        { error: "Package ID and currency are required" },
        { status: 400 }
      );
    }

    // Validate package
    const packageData = getTokenPackage(packageId);
    if (!packageData) {
      return NextResponse.json(
        { error: "Invalid package ID" },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== "USD" && currency !== "INR") {
      return NextResponse.json(
        { error: "Invalid currency. Must be USD or INR" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Get user
    const user = (await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    })) as UserRecord | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For demo purposes, we'll simulate a successful payment
    // In production, this would integrate with Stripe, Razorpay, etc.

    // Generate a mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Add purchased tokens to user account
    const updatedUser = addPurchasedTokens(user, packageData, transactionId);

    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          tier: updatedUser.tier,
          tokenBalance: updatedUser.tokenBalance,
          billing: updatedUser.billing,
          features: updatedUser.features,
          maxApiKeys: updatedUser.maxApiKeys,
        },
      }
    );

    // Return success response with payment details
    return NextResponse.json({
      success: true,
      transactionId,
      package: packageData,
      tokensAdded: packageData.tokens + packageData.bonus,
      newBalance: updatedUser.tokenBalance.total,
      newTier: updatedUser.tier,
      // In production, return the payment URL
      paymentUrl: `#success-${transactionId}`,
      message: "Tokens purchased successfully!",
    });
  } catch (error) {
    console.error("Error processing token purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
