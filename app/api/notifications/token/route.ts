import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";

// Store FCM token for a user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user with FCM token
    await db.collection("users").updateOne(
      { _id: session.user.id },
      {
        $set: {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    return NextResponse.json(
      { error: "Failed to store token" },
      { status: 500 }
    );
  }
}

// Get FCM token for a user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: session.user.id },
      { projection: { fcmToken: 1 } }
    );

    return NextResponse.json({ token: user?.fcmToken || null });
  } catch (error) {
    console.error("Error fetching FCM token:", error);
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 }
    );
  }
}

// Remove FCM token for a user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Remove FCM token from user
    await db.collection("users").updateOne(
      { _id: session.user.id },
      {
        $unset: {
          fcmToken: "",
          fcmTokenUpdatedAt: "",
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    return NextResponse.json(
      { error: "Failed to remove token" },
      { status: 500 }
    );
  }
}
