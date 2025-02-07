import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { ref, push, getDatabase } from "firebase/database";
import clientPromise from "@/lib/mongodb";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getDatabase(firebaseApp);

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

    const messagesRef = ref(firebaseDb, `messages/${params.slug}`);
    await push(messagesRef, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
