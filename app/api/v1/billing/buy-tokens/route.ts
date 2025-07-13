import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { getTokenPackage } from "@/lib/pricing-utils";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId, currency } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    const tokenPackage = getTokenPackage(packageId);
    if (!tokenPackage) {
      return NextResponse.json(
        { error: "Invalid package ID" },
        { status: 400 }
      );
    }

    // Calculate total tokens including bonus
    const totalTokens = tokenPackage.tokens + (tokenPackage.bonus || 0);
    const price =
      currency === "INR" ? tokenPackage.price.inr : tokenPackage.price.usd;

    // For demo purposes, create a mock checkout URL
    // In production, integrate with Stripe, Razorpay, etc.
    const checkoutUrl = `https://checkout.codenearby.com/tokens?package=${packageId}&currency=${currency}&amount=${price}&tokens=${totalTokens}&user=${encodeURIComponent(
      session.user.email
    )}`;

    console.log("Creating token purchase checkout:", {
      packageId,
      currency,
      price,
      totalTokens,
      user: session.user.email,
    });

    // TODO: Integrate with actual payment processor
    return NextResponse.json({
      url: checkoutUrl,
      package: {
        id: packageId,
        name: tokenPackage.name,
        tokens: totalTokens,
        price,
        currency,
      },
      message: "Token purchase checkout created (demo mode)",
    });
  } catch (error) {
    console.error("Error creating token purchase checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
