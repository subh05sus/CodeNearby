import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, userId, enabled } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const gathering = await db
      .collection("gatherings")
      .findOne({ slug: params.slug });

    if (!gathering) {
      return NextResponse.json(
        { error: "Gathering not found" },
        { status: 404 }
      );
    }

    if (gathering.hostId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can moderate" },
        { status: 403 }
      );
    }

    switch (action) {
      case "block":
        await db
          .collection("gatherings")
          .updateOne(
            { _id: gathering._id },
            { $addToSet: { blockedUsers: new ObjectId(userId) } }
          );
        break;
      case "unblock":
        await db
          .collection("gatherings")
          .updateOne(
            { _id: gathering._id },
            { $pull: { blockedUsers: userId } }
          );
        break;
      case "mute":
        await db
          .collection("gatherings")
          .updateOne(
            { _id: gathering._id },
            { $addToSet: { mutedUsers: new ObjectId(userId) } }
          );
        break;
      case "unmute":
        await db
          .collection("gatherings")
          .updateOne({ _id: gathering._id }, { $pull: { mutedUsers: userId } });
        break;
      case "hostOnly":
        await db.collection("gatherings").updateOne(
          {
            _id: gathering._id,
          },
          { $set: { hostOnly: enabled } }
        );
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error moderating gathering:", error);
    return NextResponse.json(
      { error: "Failed to moderate gathering" },
      { status: 500 }
    );
  }
}
