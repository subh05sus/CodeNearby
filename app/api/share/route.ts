/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { ObjectId } from "mongodb";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, recipientId, messageType } = await request.json();

    const client = await clientPromise;
    const database = client.db();

    // Check if the post exists
    const post = await database
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Determine if the recipient is a user or a gathering
    const isGathering = recipientId.startsWith("gathering_");
    const actualRecipientId = isGathering
      ? recipientId.replace("gathering_", "")
      : recipientId;

    if (isGathering) {
      // Share in gathering chat
      const gathering = await database
        .collection("gatherings")
        .findOne({ slug: actualRecipientId });
      if (!gathering) {
        return NextResponse.json(
          { error: "Gathering not found" },
          { status: 404 }
        );
      }

      const messageRef = ref(db, `messages/${gathering.slug}`);
      await push(messageRef, {
        senderId: session.user.id,
        senderName: session.user.name,
        senderImage: session.user.image,
        content: JSON.stringify({
          type: "post",
          postId: post._id.toString(),
          postContent: post.content.slice(0, 100) + "...",
          postImage: post.imageUrl,
          postPoll: post.poll,
          postLocation: post.location,
          postSchedule: post.schedule,
        }),
        timestamp: Date.now(),
      });
    } else {
      // Share with individual user
      const recipient = await database
        .collection("users")
        .findOne({ githubId: parseInt(actualRecipientId) });
      if (!recipient) {
        return NextResponse.json(
          { error: "Recipient not found" },
          { status: 404 }
        );
      }

      const roomId = [session.user.githubId, recipient.githubId]
        .sort()
        .join("");
      const messageRef = ref(db, `messages/${roomId}`);
      await push(messageRef, {
        senderId: session.user.githubId,
        content: JSON.stringify({
          type: "post",
          postId: post._id.toString(),
          postContent: post.content.slice(0, 100) + "...",
          postImage: post.imageUrl,
          postPoll: post.poll,
          postLocation: post.location,
          postSchedule: post.schedule,
        }),
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sharing post:", error);
    return NextResponse.json(
      { error: "Failed to share post" },
      { status: 500 }
    );
  }
}
