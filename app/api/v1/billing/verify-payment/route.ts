import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { UserRecord, addPurchasedTokens } from "@/lib/user-tiers";
import { getTokenPackage } from "@/consts/pricing";
import { ObjectId } from "mongodb";
import { razorpayInstance, validatePaymentSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification data is incomplete" },
        { status: 400 }
      );
    }

    // Verify payment signature
    if (
      !validatePaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get pending order
    const pendingOrder = await db.collection("pending_orders").findOne({
      orderId: razorpay_order_id,
      userId: session.user.id,
      status: "created",
    });

    if (!pendingOrder) {
      return NextResponse.json(
        { error: "Order not found or already processed" },
        { status: 404 }
      );
    }

    // Check if order has expired
    if (new Date() > pendingOrder.expiresAt) {
      return NextResponse.json({ error: "Order has expired" }, { status: 400 });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured" },
        { status: 400 }
      );
    }

    // Get user and package data
    const usersCollection = db.collection("users");
    const user = (await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    })) as UserRecord | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const packageData = getTokenPackage(pendingOrder.packageId);
    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Add purchased tokens to user account
    const updatedUser = addPurchasedTokens(
      user,
      packageData,
      razorpay_payment_id
    );

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

    // Update pending order status
    await db.collection("pending_orders").updateOne(
      { _id: pendingOrder._id },
      {
        $set: {
          status: "completed",
          paymentId: razorpay_payment_id,
          completedAt: new Date(),
        },
      }
    );

    // Store transaction record
    await db.collection("transactions").insertOne({
      userId: session.user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      packageId: pendingOrder.packageId,
      amount: pendingOrder.amount,
      currency: pendingOrder.currency,
      tokensAdded: packageData.tokens + packageData.bonus,
      status: "completed",
      createdAt: new Date(),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      package: packageData,
      tokensAdded: packageData.tokens + packageData.bonus,
      newBalance: updatedUser.tokenBalance.total,
      newTier: updatedUser.tier,
      message: "Payment verified and tokens added successfully!",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
