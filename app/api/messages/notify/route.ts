import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { sendMessageNotification } from "@/lib/push-notifications-server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, content, chatId } = await request.json();

    if (!recipientId || !content || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get recipient user data
    const recipientUser = await db
      .collection("users")
      .findOne({ githubId: parseInt(recipientId) });

    if (!recipientUser) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if recipient has notifications enabled and has FCM token
    const shouldSendNotification =
      recipientUser.fcmToken &&
      recipientUser.notificationSettings?.messages !== false;

    if (shouldSendNotification) {
      try {
        // Create message preview (limit to 100 characters)
        const messagePreview = content.length > 100 
          ? content.substring(0, 97) + "..."
          : content;

        await sendMessageNotification(
          recipientUser.fcmToken,
          session.user.name || session.user.githubUsername || "Someone",
          messagePreview,
          chatId
        );
      } catch (error) {
        console.error("Error sending message push notification:", error);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing message notification:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
