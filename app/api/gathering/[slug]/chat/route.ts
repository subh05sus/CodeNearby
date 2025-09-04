import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { ref, push } from "firebase/database";
import clientPromise from "@/lib/mongodb";
import { db as firebaseDb } from "@/lib/firebase";
import { sendGatheringMessageNotification } from "@/lib/push-notifications-server";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { content, isAnonymous } = await request.json();
    // Check if the user is muted
    const client = await clientPromise;
    const db = client.db();
    const gathering = await db
      .collection("gatherings")
      .findOne({ slug: params.slug });

    if (!gathering) {
      return NextResponse.json(
        { error: "Gathering not found" },
        { status: 404 }
      );
    }

    if (
      gathering.mutedUsers &&
      gathering.mutedUsers.includes(session.user.id)
    ) {
      return NextResponse.json(
        { error: "You are muted in this gathering" },
        { status: 403 }
      );
    }

    const message = {
      senderId: session.user.id,
      senderName: isAnonymous ? "Anonymous" : session.user.name,
      senderImage: isAnonymous ? "" : session.user.image,
      content,
      timestamp: Date.now(),
      isAnonymous,
      realSenderInfo: isAnonymous
        ? {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
          }
        : null,
    };

    if (!firebaseDb) {
      console.warn("Firebase database is not initialized. Skipping push to realtime DB.");
    } else {
      const messagesRef = ref(firebaseDb, `messages/${params.slug}`);
      await push(messagesRef, message);
    }

    // Send push notifications to gathering participants (except sender)
    try {
      // Get gathering participants with FCM tokens
      const participantsWithTokens = await db
        .collection("users")
        .find(
          {
            _id: { $in: gathering.participants.filter((id: string) => id !== session.user.id) },
            fcmToken: { $exists: true, $ne: null },
            "notificationSettings.gatheringMessages": { $ne: false },
          },
          { projection: { fcmToken: 1 } }
        )
        .toArray();

      const fcmTokens = participantsWithTokens
        .map((user) => user.fcmToken)
        .filter(Boolean);

      if (fcmTokens.length > 0) {
        // Create message preview (limit to 100 characters)
        const messagePreview = content.length > 100 
          ? content.substring(0, 97) + "..."
          : content;

        await sendGatheringMessageNotification(
          fcmTokens,
          isAnonymous ? "Anonymous" : (session.user.name || "Someone"),
          gathering.title || "Gathering",
          messagePreview,
          params.slug
        );
      }
    } catch (error) {
      console.error("Error sending gathering message push notifications:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
