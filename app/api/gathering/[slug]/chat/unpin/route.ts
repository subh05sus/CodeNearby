import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { db } from "@/lib/firebase";
import { ref, update } from "firebase/database";

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
    const messageRef = ref(db, `messages/${params.slug}/${messageId}`);

    await update(messageRef, { isPinned: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unpinning message:", error);
    return NextResponse.json(
      { error: "Failed to unpin message" },
      { status: 500 }
    );
  }
}
