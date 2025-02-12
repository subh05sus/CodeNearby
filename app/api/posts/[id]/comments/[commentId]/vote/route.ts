/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";

// Function to find comment in nested structure
function findComment(
  comments: any[],
  path: string[] = [],
  commentId: ObjectId
): {
  comment: any;
  path: string[];
} | null {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i]._id.toString() === commentId.toString()) {
      return { comment: comments[i], path: [...path, i.toString()] };
    }
    if (comments[i].replies) {
      const found = findComment(
        comments[i].replies,
        [...path, i.toString(), "replies"],
        commentId
      );
      if (found) return found;
    }
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
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
    const commentId = new ObjectId(params.commentId);
    const userId = session.user.id;

    const post = await db.collection("posts").findOne({ _id: postId });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const result = findComment(post.comments, [], commentId);
    if (!result) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const { comment, path } = result;

    // Check user's vote count
    const commentUserVotes = comment.userVotes || {};
    const currentVoteCount = commentUserVotes[userId] || 0;

    if (currentVoteCount >= 1) {
      return NextResponse.json(
        { error: "Maximum vote limit reached" },
        { status: 400 }
      );
    }

    // Construct the update path
    const updatePath = `comments.${path.join(".")}`;

    // Update the comment's votes
    await db.collection("posts").updateOne(
      { _id: postId },
      {
        $inc: { [`${updatePath}.votes.${voteType}`]: 1 },
        $set: { [`${updatePath}.userVotes.${userId}`]: currentVoteCount + 1 },
      }
    );

    // Fetch the updated comment
    const updatedPost: any = await db
      .collection("posts")
      .findOne({ _id: postId });
    let updatedComment = updatedPost.comments;
    for (const index of path) {
      updatedComment = updatedComment[index];
    }

    return NextResponse.json({
      _id: updatedComment._id,
      votes: updatedComment.votes,
      userVotes: updatedComment.userVotes,
    });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json(
      { error: "Failed to vote on comment" },
      { status: 500 }
    );
  }
}
