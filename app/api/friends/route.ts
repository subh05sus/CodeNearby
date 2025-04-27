/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";
import { db as firebaseDb } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { cookies } from "next/headers";

const minimum = (a: string, b: string) => (a < b ? a : b);
const maximum = (a: string, b: string) => (a > b ? a : b);

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    cookies();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendIds = user.friends || [];
    const friends = await db
      .collection("users")
      .find(
        { githubId: { $in: friendIds } },
        {
          projection: {
            _id: 0,
            githubId: 1,
            name: 1,
            githubUsername: 1,
            image: 1,
          },
        }
      )
      .toArray();

    // Get last messages from Firebase for each friend
    const lastMessages = await Promise.all(
      friends.map(async (friend) => {
        const chatId = [
          minimum(session.user.githubId as string, friend.githubId as string),
          maximum(session.user.githubId as string, friend.githubId as string),
        ].join("");
        const messagesRef = ref(firebaseDb, `messages/${chatId}`);
        const snapshot = await get(messagesRef);
        const messages = snapshot.val() || {};
        const lastMessage: any = Object.values(messages).sort(
          (a: any, b: any) => b.timestamp - a.timestamp
        )[0];
        return lastMessage
          ? {
              content: lastMessage.content,
              timestamp: lastMessage.timestamp,
              senderId: lastMessage.senderId,
            }
          : null;
      })
    );

    // Combine friends with their last messages
    const friendsWithMessages = friends.map((friend, index) => ({
      ...friend,
      lastMessage: lastMessages[index],
    }));

    return NextResponse.json(friendsWithMessages);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}
