import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const result = await db
    .collection("users")
    .updateOne(
      { email },
      { $set: { emailUnsubscribed: true, emailUnsubscribedAt: new Date() } }
    );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
