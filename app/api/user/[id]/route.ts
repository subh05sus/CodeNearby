import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    console.log("params.id", params.id);
    const user = await db.collection("users").findOne({ githubId: Number(params.id) });
    console.log("user", user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
