import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";

// Get notification settings for a user
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
      { projection: { notificationSettings: 1 } }
    );

    const defaultSettings = {
      messages: true,
      friendRequests: true,
      gatheringMessages: true,
      posts: true,
      events: true,
      pushEnabled: false,
    };

    return NextResponse.json({
      settings: user?.notificationSettings || defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// Update notification settings for a user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Update user notification settings
    await db.collection("users").updateOne(
      { _id: session.user.id },
      {
        $set: {
          notificationSettings: settings,
          notificationSettingsUpdatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
