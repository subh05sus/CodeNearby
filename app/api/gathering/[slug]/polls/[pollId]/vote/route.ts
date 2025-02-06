import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { db } from "@/lib/firebase";
import { ref, runTransaction } from "firebase/database";

export async function POST(
  request: Request,
  { params }: { params: { slug: string; pollId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { optionIndex } = await request.json();
    const pollRef = ref(db, `polls/${params.slug}/${params.pollId}`);

    await runTransaction(pollRef, (currentData) => {
      if (currentData === null) {
        return { error: "Poll not found" };
      }

      if (!currentData.votes) {
        currentData.votes = {};
      }

      if (!currentData.votes[optionIndex]) {
        currentData.votes[optionIndex] = 0;
      }

      currentData.votes[optionIndex]++;
      currentData.totalVotes = (currentData.totalVotes || 0) + 1;

      return currentData;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Failed to vote on poll" },
      { status: 500 }
    );
  }
}
