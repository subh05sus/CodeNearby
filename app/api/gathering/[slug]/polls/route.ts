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
    const { question, options } = await request.json();
    const pollsRef = ref(db, `polls/${params.slug}`);

    const poll = {
      creatorId: session.user.id,
      creatorName: session.user.name,
      question,
      options,
      votes: {},
      createdAt: Date.now(),
    };

    const newPollRef = await push(pollsRef, poll);

    return NextResponse.json({ success: true, pollId: newPollRef.key });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}
