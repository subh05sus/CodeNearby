import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, isAnonymous } = await request.json();
    const messagesRef = ref(db, `messages/${params.slug}`);

    const message = {
      senderId: session.user.id,
      senderName: isAnonymous ? "Anonymous" : session.user.name,
      senderImage: isAnonymous ? "" : session.user.image,
      content,
      timestamp: Date.now(),
      isAnonymous,
    };

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
