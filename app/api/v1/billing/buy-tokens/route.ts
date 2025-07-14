import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { UserRecord, getTokenPackage } from "@/lib/user-tiers";
import { ObjectId } from "mongodb";
import {
  razorpayInstance,
  convertToSmallestUnit,
  generateReceiptId,
} from "@/lib/razorpay";

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

    // Calculate amount in paise (Razorpay uses smallest currency unit)
    const amount =
      currency === "INR"
        ? convertToSmallestUnit(packageData.price.inr) // Convert rupees to paise
        : convertToSmallestUnit(packageData.price.usd); // Convert dollars to cents

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount,
      currency: currency,
      receipt: generateReceiptId(session.user.id),
      notes: {
        userId: session.user.id,
        packageId: packageId,
        tokens: packageData.tokens.toString(),
        bonus: packageData.bonus.toString(),
      },
    });

    // Store pending order in database for verification later
    await db.collection("pending_orders").insertOne({
      orderId: razorpayOrder.id,
      userId: session.user.id,
      packageId: packageId,
      amount: amount,
      currency: currency,
      status: "created",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Return Razorpay order details for frontend
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      package: packageData,
      key: process.env.RZP_TEST_KEY_ID,
      userEmail: session.user.email,
      userName: session.user.name,
      message: "Order created successfully. Proceed with payment.",
    });
  } catch (error) {
    console.error("Error processing token purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
