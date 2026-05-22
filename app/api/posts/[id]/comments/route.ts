/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/options";
import { sendEmail } from "@/lib/email/send";
import { PostCommentEmail } from "@/lib/email/templates/post-comment";
import React from "react";

// Recursive function to insert a reply at the correct depth
function addReplyToComment(
  comments: any[],
  parentId: ObjectId,
  reply: any
): boolean {
  for (const comment of comments) {
    if (comment._id.equals(parentId)) {
      comment.replies.push(reply);
      return true;
    }
    if (comment.replies.length > 0) {
      if (addReplyToComment(comment.replies, parentId, reply)) {
        return true;
      }
    }
  }
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, parentCommentId } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const postId = new ObjectId(params.id);
    const userId = new ObjectId(session.user.id);

    // Create the new comment structure
    const newComment = {
      _id: new ObjectId(),
      userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: { up: 0, down: 0 },
      userVotes: {},
      replies: [],
      user: {
        name: session.user.name,
        image: session.user.image,
      },
    };

    // Fetch the post document
    const post = await db.collection("posts").findOne({ _id: postId });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If replying to an existing comment (nested reply)
    if (parentCommentId) {
      const parentObjectId = new ObjectId(parentCommentId);

      // Find and add the reply recursively
      const updated = addReplyToComment(
        post.comments,
        parentObjectId,
        newComment
      );

      if (!updated) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Update the post in MongoDB
      await db
        .collection("posts")
        .updateOne({ _id: postId }, { $set: { comments: post.comments } });
    } else {
      // If it's a top-level comment
      await db
        .collection("posts")
        .updateOne({ _id: postId }, { $push: { comments: newComment as any } });
    }

    // Notify post author if they are not the commenter
    if (post.userId && post.userId.toString() !== session.user.id) {
      const postAuthor = await db
        .collection("users")
        .findOne({ _id: new ObjectId(post.userId.toString()) });
      if (postAuthor?.email) {
        sendEmail({
          to: postAuthor.email,
          subject: `${session.user.name} commented on your post`,
          react: React.createElement(PostCommentEmail, {
            authorName: postAuthor.name || postAuthor.email,
            commenterName: session.user.name,
            commenterUsername: session.user.githubUsername,
            commenterAvatar: session.user.image,
            postTitle: post.title,
            commentPreview: content,
            postId: params.id,
          }),
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
