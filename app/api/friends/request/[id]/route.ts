import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/options";
import { sendEmail } from "@/lib/email/send";
import { FriendAcceptedEmail } from "@/lib/email/templates/friend-accepted";
import React from "react";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const requestId = new ObjectId(params.id);
    const friendRequest = await db.collection("friendRequests").findOne({
      _id: requestId,
      receiverGithubId: Number.parseInt(session.user.githubId),
    });

    if (!friendRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await db
      .collection("friendRequests")
      .updateOne({ _id: requestId }, { $set: { status } });

    if (status === "accepted") {
      // Add users to each other's friends list
      await db.collection("users").updateOne(
        { githubId: Number.parseInt(session.user.githubId) },
        { $addToSet: { friends: friendRequest.senderGithubId } } // Ensure array
      );

      await db
        .collection("users")
        .updateOne(
          { githubId: friendRequest.senderGithubId },
          { $addToSet: { friends: Number.parseInt(session.user.githubId) } }
        );

      // Notify original sender that their request was accepted
      const senderUser = await db.collection("users").findOne({
        githubId: friendRequest.senderGithubId,
      });
      if (senderUser?.email) {
        sendEmail({
          to: senderUser.email,
          subject: `${session.user.name} accepted your connection request 🎉`,
          react: React.createElement(FriendAcceptedEmail, {
            recipientName: senderUser.name || senderUser.email,
            acceptorName: session.user.name,
            acceptorUsername: session.user.githubUsername,
            acceptorAvatar: session.user.image,
          }),
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
