import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ref, update, child, getDatabase } from "firebase/database";
import { authOptions } from "@/app/options";
import { getServerSession } from "next-auth/next";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messageId } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const gathering = await db
      .collection("gatherings")
      .findOne({ slug: params.slug });
    if (!gathering || gathering.hostId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const firebaseDb = getDatabase();
    const messagesRef = ref(firebaseDb, `messages/${params.slug}`);

    // Unpin all messages
    await update(messagesRef, {
      "/isPinned": null,
    });

    // Pin the selected message
    await update(child(messagesRef, messageId), {
      isPinned: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error pinning message:", error);
    return NextResponse.json(
      { error: "Failed to pin message" },
      { status: 500 }
    );
  }
}
