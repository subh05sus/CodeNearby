import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";

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

    // Get current comment
    const post = await db.collection("posts").findOne(
      {
        _id: postId,
        "comments._id": commentId,
      },
      { projection: { "comments.$": 1 } }
    );

    if (!post || !post.comments?.[0]) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const comment = post.comments[0];
    // Check user's vote count
    const commentUserVotes = comment.userVotes || {};
    const currentVoteCount = commentUserVotes[userId] || 0;

    if (currentVoteCount >= 1) {
      return NextResponse.json(
        { error: "Maximum vote limit reached" },
        { status: 400 }
      );
    }

    // Update the comment's votes
    await db.collection("posts").updateOne(
      {
        _id: postId,
        "comments._id": commentId,
      },
      {
        $inc: { [`comments.$.votes.${voteType}`]: 1 },
        $set: { [`comments.$.userVotes.${userId}`]: currentVoteCount + 1 },
      }
    );

    // Fetch the updated comment
    const updatedPost = await db.collection("posts").findOne(
      {
        _id: postId,
        "comments._id": commentId,
      },
      { projection: { "comments.$": 1 } }
    );

    if (!updatedPost || !updatedPost.comments?.[0]) {
      return NextResponse.json(
        { error: "Failed to fetch updated comment" },
        { status: 500 }
      );
    }

    const updatedComment = updatedPost.comments[0];

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
