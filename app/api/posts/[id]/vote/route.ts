import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";
import { sendEmail } from "@/lib/email/send";
import { PostMilestoneEmail } from "@/lib/email/templates/post-milestone";
import React from "react";

const VOTE_MILESTONES = [1, 10, 50, 100];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { voteType } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const postId = new ObjectId(params.id);
    const userId = session.user.id;

    // Get current post
    const post = await db.collection("posts").findOne({ _id: postId });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check user's vote count
    const postUserVotes = post.userVotes || {};
    const currentVoteCount = postUserVotes[userId] || 0;

    if (currentVoteCount >= 10) {
      return NextResponse.json(
        { error: "Maximum vote limit reached" },
        { status: 400 }
      );
    }

    // Update vote counts
    const updateResult = await db.collection("posts").findOneAndUpdate(
      { _id: postId },
      {
        $inc: { [`votes.${voteType}`]: 1 },
        $set: { [`userVotes.${userId}`]: currentVoteCount + 1 },
      },
      { returnDocument: "after" }
    );
    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update vote" },
        { status: 500 }
      );
    }

    // Check vote milestones and notify post author (only for upvotes)
    if (voteType === "up") {
      const newUpVotes = updateResult.votes?.up ?? 0;
      const alreadyEmailed: number[] = updateResult.milestonesEmailed || [];
      const hitMilestone = VOTE_MILESTONES.find(
        (m) => newUpVotes >= m && !alreadyEmailed.includes(m)
      );
      if (hitMilestone && updateResult.userId && updateResult.userId.toString() !== userId) {
        await db
          .collection("posts")
          .updateOne(
            { _id: postId },
            { $addToSet: { milestonesEmailed: hitMilestone } }
          );
        const postAuthor = await db
          .collection("users")
          .findOne({ _id: new ObjectId(updateResult.userId.toString()) });
        if (postAuthor?.email) {
          sendEmail({
            to: postAuthor.email,
            subject: `Your post hit ${hitMilestone} votes on CodeNearby!`,
            react: React.createElement(PostMilestoneEmail, {
              authorName: postAuthor.name || postAuthor.email,
              postTitle: updateResult.title,
              postId: params.id,
              milestone: hitMilestone,
            }),
          }).catch(console.error);
        }
      }
    }

    // Return only serializable data
    const { _id, votes, userVotes } = updateResult;
    return NextResponse.json({ _id, votes, userVotes });
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json(
      { error: "Failed to vote on post" },
      { status: 500 }
    );
  }
}
