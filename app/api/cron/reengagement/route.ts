import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendEmail } from "@/lib/email/send";
import { ReengagementEmail, VARIANTS as REENGAGEMENT_V } from "@/lib/email/templates/reengagement";
import { DormantEmail, VARIANTS as DORMANT_V } from "@/lib/email/templates/dormant";
import { OnboardingIncompleteEmail, VARIANTS as ONBOARDING_V } from "@/lib/email/templates/onboarding-incomplete";
import { FriendActivityEmail, VARIANTS as FRIEND_V } from "@/lib/email/templates/friend-activity";
import { NoFriendsEmail, VARIANTS as NO_FRIENDS_V } from "@/lib/email/templates/no-friends";
import { DeveloperNearbyEmail, VARIANTS as NEARBY_V } from "@/lib/email/templates/developer-nearby";
import { LastChanceEmail, VARIANTS as LAST_CHANCE_V } from "@/lib/email/templates/last-chance";
import { ObjectId } from "mongodb";
import React from "react";

export const dynamic = "force-dynamic";

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function pickVariant(len: number): number {
  return Math.floor(Math.random() * len);
}

// Prevents sending more than one cron email per user every 3 days
function cooldown() {
  return {
    $or: [
      { lastAnyEmailAt: { $exists: false } },
      { lastAnyEmailAt: { $lte: daysAgo(3) } },
    ],
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markSent = async (userId: any, typeField: string) => {
    await db.collection("users").updateOne(
      { _id: userId },
      { $set: { [typeField]: now, lastAnyEmailAt: now } }
    );
  };

  const counts = {
    weekSent: 0,
    dormantSent: 0,
    onboardingSent: 0,
    friendActivitySent: 0,
    noFriendsSent: 0,
    nearbyDevSent: 0,
    lastChanceSent: 0,
    errors: 0,
  };

  // Shared data fetched once upfront
  const thirtyDaysAgoId = ObjectId.createFromTime(Math.floor(daysAgo(30).getTime() / 1000));

  const [trendingRaw, suggestedDevsRaw, newDevCount] = await Promise.all([
    db.collection("posts").find({}).sort({ "votes.up": -1 }).limit(3).toArray(),
    db
      .collection("users")
      .find({ lastSeenAt: { $gte: daysAgo(14) }, githubUsername: { $exists: true, $ne: null } })
      .limit(6)
      .project({ name: 1, githubUsername: 1, githubBio: 1, image: 1 })
      .toArray(),
    db.collection("users").countDocuments({ _id: { $gte: thirtyDaysAgoId } }),
  ]);

  const trendingPosts = trendingRaw.map((p) => ({
    title: p.title || p.content?.slice(0, 60),
    authorName: p.user?.name || "A developer",
    votes: p.votes?.up || 0,
  }));

  const suggestedDevPool = suggestedDevsRaw.map((d) => ({
    name: d.name as string | undefined,
    githubUsername: d.githubUsername as string,
    githubBio: d.githubBio as string | undefined,
    image: d.image as string | undefined,
  }));

  // --- Pass 1: 1-week nudge (7–14 days inactive) ---
  const weekCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(7), $gte: daysAgo(14) },
      $and: [
        { $or: [{ lastReengagementEmailAt: { $exists: false } }, { lastReengagementEmailAt: { $lte: daysAgo(30) } }] },
        cooldown(),
      ],
    })
    .limit(100)
    .toArray();

  for (const user of weekCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(REENGAGEMENT_V.length);
      await sendEmail({
        to: user.email,
        subject: REENGAGEMENT_V[variant].subject(firstName, daysSince),
        react: React.createElement(ReengagementEmail, {
          userName: user.name || user.email,
          recentPosts: trendingPosts,
          daysSince,
          variant,
        }),
      });
      await markSent(user._id, "lastReengagementEmailAt");
      counts.weekSent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 2: Dormant (60–90 days inactive, never sent) ---
  const dormantCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(60), $gte: daysAgo(90) },
      lastDormantEmailAt: { $exists: false },
      $and: [cooldown()],
    })
    .limit(100)
    .toArray();

  for (const user of dormantCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(DORMANT_V.length);
      await sendEmail({
        to: user.email,
        subject: DORMANT_V[variant].subject(firstName, daysSince),
        react: React.createElement(DormantEmail, {
          userName: user.name || user.email,
          daysSince,
          variant,
        }),
      });
      await markSent(user._id, "lastDormantEmailAt");
      counts.dormantSent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 3: Onboarding Incomplete (active 1–7 days, setup not done, never nudged) ---
  const onboardingCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      onboardingCompleted: { $ne: true },
      lastSeenAt: { $lte: daysAgo(1), $gte: daysAgo(7) },
      lastOnboardingNudgeAt: { $exists: false },
      $and: [cooldown()],
    })
    .limit(50)
    .toArray();

  for (const user of onboardingCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const variant = pickVariant(ONBOARDING_V.length);
      await sendEmail({
        to: user.email,
        subject: ONBOARDING_V[variant].subject(firstName),
        react: React.createElement(OnboardingIncompleteEmail, {
          userName: user.name || user.email,
          variant,
        }),
      });
      await markSent(user._id, "lastOnboardingNudgeAt");
      counts.onboardingSent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 4: Friend Activity Nudge (3–5 days inactive, has at least one friend) ---
  const friendActivityCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(3), $gte: daysAgo(5) },
      "friends.0": { $exists: true },
      $and: [
        { $or: [{ lastFriendActivityEmailAt: { $exists: false } }, { lastFriendActivityEmailAt: { $lte: daysAgo(30) } }] },
        cooldown(),
      ],
    })
    .limit(100)
    .toArray();

  for (const user of friendActivityCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(FRIEND_V.length);
      await sendEmail({
        to: user.email,
        subject: FRIEND_V[variant].subject(firstName, daysSince),
        react: React.createElement(FriendActivityEmail, {
          userName: user.name || user.email,
          daysSince,
          trendingPosts,
          variant,
        }),
      });
      await markSent(user._id, "lastFriendActivityEmailAt");
      counts.friendActivitySent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 5: No Friends Yet (14–21 days inactive, empty friends list, never sent) ---
  const noFriendsCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(14), $gte: daysAgo(21) },
      lastNoFriendsEmailAt: { $exists: false },
      $and: [
        { $or: [{ friends: { $exists: false } }, { friends: { $size: 0 } }] },
        cooldown(),
      ],
    })
    .limit(50)
    .toArray();

  for (const user of noFriendsCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(NO_FRIENDS_V.length);
      const suggestions = suggestedDevPool
        .filter((d) => d.githubUsername !== user.githubUsername)
        .slice(0, 3);
      await sendEmail({
        to: user.email,
        subject: NO_FRIENDS_V[variant].subject(firstName, daysSince),
        react: React.createElement(NoFriendsEmail, {
          userName: user.name || user.email,
          daysSince,
          suggestedDevs: suggestions,
          variant,
        }),
      });
      await markSent(user._id, "lastNoFriendsEmailAt");
      counts.noFriendsSent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 6: New Developer Nearby (21–30 days inactive, has location, never sent) ---
  const nearbyCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(21), $gte: daysAgo(30) },
      githubLocation: { $exists: true, $nin: [null, ""] },
      lastNearbyEmailAt: { $exists: false },
      $and: [cooldown()],
    })
    .limit(50)
    .toArray();

  for (const user of nearbyCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(NEARBY_V.length);
      await sendEmail({
        to: user.email,
        subject: NEARBY_V[variant].subject(firstName, daysSince, newDevCount, user.githubLocation),
        react: React.createElement(DeveloperNearbyEmail, {
          userName: user.name || user.email,
          daysSince,
          newDevCount,
          userLocation: user.githubLocation,
          variant,
        }),
      });
      await markSent(user._id, "lastNearbyEmailAt");
      counts.nearbyDevSent++;
    } catch {
      counts.errors++;
    }
  }

  // --- Pass 7: Last-Chance Win-back (90–120 days inactive, never sent) ---
  const lastChanceCandidates = await db
    .collection("users")
    .find({
      email: { $exists: true, $ne: null },
      lastSeenAt: { $lte: daysAgo(90), $gte: daysAgo(120) },
      lastLastChanceEmailAt: { $exists: false },
      $and: [cooldown()],
    })
    .limit(50)
    .toArray();

  for (const user of lastChanceCandidates) {
    try {
      const firstName = user.name?.split(" ")[0] || "hey";
      const daysSince = Math.floor((now.getTime() - new Date(user.lastSeenAt).getTime()) / 86400000);
      const variant = pickVariant(LAST_CHANCE_V.length);
      await sendEmail({
        to: user.email,
        subject: LAST_CHANCE_V[variant].subject(firstName, daysSince),
        react: React.createElement(LastChanceEmail, {
          userName: user.name || user.email,
          daysSince,
          variant,
        }),
      });
      await markSent(user._id, "lastLastChanceEmailAt");
      counts.lastChanceSent++;
    } catch {
      counts.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...counts });
}
