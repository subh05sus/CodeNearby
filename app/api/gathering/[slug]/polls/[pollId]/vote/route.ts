import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import { ref, runTransaction } from "firebase/database";
import { db as firebaseDb } from "@/lib/firebase";

export async function POST(
  request: Request,
  { params }: { params: { slug: string; pollId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optionIndex } = await request.json();
    const pollRef = ref(firebaseDb, `polls/${params.slug}/${params.pollId}`);

    await runTransaction(pollRef, (currentData) => {
      if (currentData === null) {
        return { error: "Poll not found" };
      }

      const updatedData = { ...currentData };

      // Initialize votes object and totalVotes if they don't exist
      if (!updatedData.votes) {
        updatedData.votes = {};
      }
      if (typeof updatedData.totalVotes !== "number") {
        updatedData.totalVotes = 0;
      }

      // Remove previous vote if exists
      Object.entries(updatedData.votes).forEach(([key, value]) => {
        if (Array.isArray(value) && value.includes(session.user.id)) {
          updatedData.votes[key] = value.filter((id) => id !== session.user.id);
          updatedData.totalVotes = Math.max(0, updatedData.totalVotes - 1);
        }
      });

      // Add new vote
      if (!updatedData.votes[optionIndex]) {
        updatedData.votes[optionIndex] = [];
      }
      updatedData.votes[optionIndex].push(session.user.id);
      updatedData.totalVotes++;

      return updatedData;
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
