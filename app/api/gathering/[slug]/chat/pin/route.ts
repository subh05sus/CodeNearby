import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

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
    const messagesRef = ref(db, `messages/${params.slug}`);

    interface Message {
      isPinned: boolean;
    }

    // Unpin any previously pinned message
    const snapshot = await get(messagesRef);
    const messages = snapshot.val();
    for (const [key, message] of Object.entries(messages) as [
      string,
      Message
    ][]) {
      if (message.isPinned) {
        await update(ref(db, `messages/${params.slug}/${key}`), {
          isPinned: false,
        });
      }
    }

    // Pin the new message
    await update(ref(db, `messages/${params.slug}/${messageId}`), {
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
