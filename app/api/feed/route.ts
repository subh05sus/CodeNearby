import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { getCachedData, cacheData } from "@/lib/redis";

export const dynamic = "force-dynamic";

type GitHubEvent = {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string; id?: number };
  repo: { name: string };
  payload: { action?: string; ref_type?: string };
  created_at: string;
};

function mapEventToPost(e: GitHubEvent) {
  const getPersonalizedMessages = () => {
    switch (e.type) {
      case "WatchEvent":
        return [
          `just starred ${e.repo.name} ⭐`,
          `found ${e.repo.name} interesting and starred it`,
          `added ${e.repo.name} to their favorites`,
          `gave ${e.repo.name} a star`,
          `is keeping an eye on ${e.repo.name}`,
        ];
      case "CreateEvent":
        return [
          `created a new ${e.payload?.ref_type || "repository"}`,
          `started something new in ${e.repo.name}`,
          `just created ${e.payload?.ref_type || "something"}`,
          `launched a new ${e.payload?.ref_type || "project"}`,
          `built ${e.payload?.ref_type || "something"}`,
        ];
      case "ForkEvent":
        return [
          `forked ${e.repo.name} to work on it`,
          `made their own copy of ${e.repo.name}`,
          `forked ${e.repo.name} for some experiments`,
          `decided to fork ${e.repo.name}`,
          `is building on top of ${e.repo.name}`,
        ];
      case "PullRequestEvent":
        return [
          `${
            e.payload?.action === "opened" ? "opened" : "updated"
          } a pull request in ${e.repo.name}`,
          `wants to contribute to ${e.repo.name}`,
          `submitted changes to ${e.repo.name}`,
          `is collaborating on ${e.repo.name}`,
          `made improvements to ${e.repo.name}`,
        ];
      case "PushEvent":
        return [
          `pushed fresh code to ${e.repo.name}`,
          `committed new changes to ${e.repo.name}`,
          `updated ${e.repo.name} with latest work`,
          `shipped some code to ${e.repo.name}`,
          `made progress on ${e.repo.name}`,
        ];
      default:
        return [
          `is active on ${e.repo.name}`,
          `did something cool with ${e.repo.name}`,
          `interacted with ${e.repo.name}`,
          `engaged with ${e.repo.name}`,
          `worked on ${e.repo.name}`,
        ];
    }
  };

  const messages = getPersonalizedMessages();
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const content = `${e.actor.login} ${randomMessage} https://github.com/${e.repo.name}`;

  return {
    _id: `gh_event_${e.id}`,
    userId: `${e.actor.login}`,
    content,
    imageUrl: undefined as string | undefined,
    createdAt: e.created_at,
    votes: { up: 0, down: 0 },
    userVotes: {} as Record<string, number>,
    comments: [] as any[],
    poll: undefined,
    location: undefined,
    schedule: undefined,
    user: {
      name: e.actor.login,
      image: e.actor.avatar_url,
      githubId: e.actor.id?.toString?.() || undefined,
      githubUsername: e.actor.login,
    },
    __source: "github_event",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const includeGithub = (searchParams.get("includeGithub") || "1") === "1";
  const limit = 25;
  const skip = (page - 1) * limit;

  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db();

    // Fetch DB posts (same pipeline as /api/posts)
    const posts = await db
      .collection("posts")
      .aggregate([
        { $match: {} },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();

    // For page 1, enrich with GitHub received events of the logged-in user (if enabled)
    let eventPosts: any[] = [];
    if (includeGithub && page === 1 && session?.user?.githubUsername) {
      const cacheKey = `github:received:${session.user.githubUsername}`;
      let events = await getCachedData<GitHubEvent[]>(cacheKey);
      if (!events) {
        const res = await fetch(
          `https://api.github.com/users/${session.user.githubUsername}/received_events`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.ok) {
          const rawEvents = (await res.json()) as GitHubEvent[];
          // Filter out bot events
          events = rawEvents.filter((e) => !e.actor.login.includes("[bot]"));
          // Cache for 2 hours
          await cacheData(cacheKey, events, 2 * 60 * 60);
        } else {
          events = [];
        }
      }

      // Map to post-like objects, take a handful to avoid flooding
      eventPosts = (events || []).map(mapEventToPost);
    }

    // Merge and de-duplicate by _id
    const combined = [...eventPosts, ...posts];
    const seen = new Set<string>();
    const deduped = combined.filter((item: any) => {
      const id = String(item._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Sort by createdAt desc
    deduped.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(deduped);
  } catch (error) {
    console.error("Error building feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
