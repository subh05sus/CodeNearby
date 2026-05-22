import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendEmail } from "@/lib/email/send";
import { ReengagementEmail } from "@/lib/email/templates/reengagement";
import { DormantEmail } from "@/lib/email/templates/dormant";
import React from "react";

export const dynamic = "force-dynamic";

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  // Guard with CRON_SECRET so only Vercel Cron (or you) can trigger it
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const now = new Date();
  let weekSent = 0;
  let dormantSent = 0;
  let errors = 0;

  // --- Pass 1: 1-week nudge ---
  // lastSeenAt between 7–14 days ago, no reengagement email in last 30 days
  const weekCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: {
        $lte: daysAgo(7),
        $gte: daysAgo(14),
      },
      $or: [
        { lastReengagementEmailAt: { $exists: false } },
        { lastReengagementEmailAt: { $lte: daysAgo(30) } },
      ],
    })
    .limit(100)
    .toArray();

  // Fetch 3 trending posts for context
  const trendingPosts = await db
    .collection("posts")
    .find({})
    .sort({ "votes.up": -1 })
    .limit(3)
    .toArray();

  const recentPosts = trendingPosts.map((p) => ({
    title: p.title || p.content?.slice(0, 60),
    authorName: p.user?.name || "A developer",
    votes: p.votes?.up || 0,
  }));

  for (const user of weekCandidates) {
    try {
      const daysSince = Math.floor(
        (now.getTime() - new Date(user.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      await sendEmail({
        to: user.email,
        subject: `${user.name?.split(" ")[0] || "Hey"}, your developer community misses you 👋`,
        react: React.createElement(ReengagementEmail, {
          userName: user.name || user.email,
          recentPosts,
          daysSince,
        }),
      });
      await db
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { lastReengagementEmailAt: now } });
      weekSent++;
    } catch {
      errors++;
    }
  }

  // --- Pass 2: dormant nudge ---
  // lastSeenAt between 60–90 days ago, no dormant email ever sent
  const dormantCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: {
        $lte: daysAgo(60),
        $gte: daysAgo(90),
      },
      lastDormantEmailAt: { $exists: false },
    })
    .limit(100)
    .toArray();

  for (const user of dormantCandidates) {
    try {
      const daysSince = Math.floor(
        (now.getTime() - new Date(user.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      await sendEmail({
        to: user.email,
        subject: `A lot has changed since you left, ${user.name?.split(" ")[0] || "friend"}`,
        react: React.createElement(DormantEmail, {
          userName: user.name || user.email,
          daysSince,
        }),
      });
      await db
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { lastDormantEmailAt: now } });
      dormantSent++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    weekSent,
    dormantSent,
    errors,
  });
}
