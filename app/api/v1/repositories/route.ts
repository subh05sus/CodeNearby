import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  UserRecord,
  canConsumeTokens,
  consumeTokens,
  shouldResetDailyTokens,
  resetDailyTokens,
} from "@/lib/user-tiers";
import { generateMessage } from "@/lib/ai";
import { getEstimatedTokenCost } from "@/consts/pricing";
import crypto from "crypto";
import { ObjectId } from "mongodb";

// Lightweight GitHub repository search (no import; defined locally)
async function searchGitHubRepositories({
  query,
  language,
  limit,
}: {
  query: string;
  language?: string | null;
  limit?: number | null;
}): Promise<any[]> {
  const qParts: string[] = [];
  if (query && query.trim()) {
    qParts.push(`${query} in:name,description`);
  }
  if (language && language.trim()) {
    qParts.push(`language:${language.trim()}`);
  }
  const q = qParts.join(" ").trim() || "stars:>1";
  const perPage = Math.min(Math.max(Number(limit || 10), 1), 30); // 1..30

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    q
  )}&per_page=${perPage}&sort=stars&order=desc`;

  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    // next: { revalidate: 600 } // optional caching hint if running on Next runtime
  });
  if (!resp.ok) {
    throw new Error(`GitHub search failed: ${resp.status}`);
  }
  const data = await resp.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((repo: any) => ({
    id: String(repo.id),
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    html_url: repo.html_url,
    description: repo.description,
    fork: repo.fork,
    url: repo.url,
    homepage: repo.homepage,
    visibility: repo.visibility,
    language: repo.language,
    topics: repo.topics || [],
    license: repo.license ? repo.license.name : null,
    size: repo.size,
    default_branch: repo.default_branch,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    stargazers_count: repo.stargazers_count,
    watchers_count: repo.watchers_count,
    forks_count: repo.forks_count,
    open_issues_count: repo.open_issues_count,
    archived: repo.archived,
    disabled: repo.disabled,
    owner: repo.owner
      ? {
          login: repo.owner.login,
          id: String(repo.owner.id),
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
          type: repo.owner.type,
        }
      : null,
  }));
}

// API Key validation helper (same as in other routes)
async function validateApiKey(apiKey: string) {
  if (!apiKey) {
    console.log({
      route: "/api/v1/repositories",
      event: "validateApiKey:missing",
    });
    return { valid: false, error: "API key is required", status: 401 };
  }

  const client = await clientPromise;
  const db = client.db();
  const apiKeysCollection = db.collection("apiKeys");
  const usersCollection = db.collection("users");

  // Hash the provided API key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  // Find the API key
  const apiKeyDoc = await db.collection("apiKeys").findOne({
    keyHash,
    isActive: true,
  });

  if (!apiKeyDoc) {
    return { valid: false, error: "Invalid or inactive API key", status: 401 };
  }

  // Get the user associated with this API key
  const user = (await usersCollection.findOne({
    _id: apiKeyDoc.userId,
  })) as UserRecord | null;

  if (!user) {
    return { valid: false, error: "User not found", status: 404 };
  }

  // Update last used timestamp
  await apiKeysCollection.updateOne(
    { _id: apiKeyDoc._id },
    { $set: { lastUsed: new Date() } }
  );

  return { valid: true, user, apiKeyId: apiKeyDoc._id };
}

export async function POST(request: Request) {
  const requestId = `repo_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
  const startedAt = Date.now();
  try {
    // Get API key from headers
    const apiKey = request.headers.get("x-api-key");

    // Validate API key and get user
    const validation = await validateApiKey(apiKey || "");
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    let user = validation.user!;

    // Check if daily tokens need to be reset
    if (shouldResetDailyTokens(user)) {
      const client = await clientPromise;
      const db = client.db();
      const usersCollection = db.collection("users");

      const updatedUser = resetDailyTokens(user);

      await usersCollection.updateOne(
        { _id: new ObjectId(user._id) },
        {
          $set: {
            tokenBalance: updatedUser.tokenBalance,
            usage: updatedUser.usage,
            lastTokenReset: updatedUser.lastTokenReset,
          },
        }
      );

      user = updatedUser;
    }

    // Check if user has access to repository search (Premium feature)
    if (!user.features.repositorySearch) {
      return NextResponse.json(
        {
          error: "Repository search is a Premium feature",
          message:
            "Upgrade to Premium tier to access repository search functionality",
          upgradeUrl: "/upgrade",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const query: string = body?.query;
    const language: string | undefined = body?.language;
    const limitRaw: any = body?.limit;
    const limit: number | null =
      typeof limitRaw === "number"
        ? limitRaw
        : typeof limitRaw === "string" && limitRaw.trim()
        ? parseInt(limitRaw, 10)
        : null;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Estimate and pre-check tokens before AI call
    const estimate = getEstimatedTokenCost("/api/v1/repositories").average;
    if (!canConsumeTokens(user, estimate)) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: estimate,
          available: user.tokenBalance.total,
          message: "Please purchase more tokens to continue using the API",
          estimate,
        },
        { status: 402 }
      );
    }

    const repositories = await searchGitHubRepositories({
      query,
      language,
      limit,
    });

    // Generate AI prompt for repository search insights (after fetching repos)
    const aiPrompt = `You are an AI assistant helping to analyze GitHub repository search results based on a user's query.

User Query: "${query}"
Repositories fetched: ${repositories.length}

Tasks:
- Summarize likely technologies and themes you infer from the query and language filter.
- Suggest what kinds of projects to expect from these results.
- Provide 3-5 concrete tips to refine the search (filters, keywords, stars, updated range).

Keep it concise, clear, and actionable.`;

    const { aiResponse, tokensUsed } = await generateMessage(aiPrompt);

    // Check if user has enough tokens
    if (!canConsumeTokens(user, tokensUsed)) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: tokensUsed,
          available: user.tokenBalance.total,
          message: "Please purchase more tokens to continue using the API",
        },
        { status: 402 }
      );
    }

    // Consume tokens (actual or fallback to estimate)
    const actualUsage = tokensUsed && tokensUsed > 0 ? tokensUsed : estimate;
    const updatedUser = consumeTokens(user, actualUsage);

    // Update user in database
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          tokenBalance: updatedUser.tokenBalance,
          usage: updatedUser.usage,
        },
      }
    );

    // repositories already fetched above

    // Return successful response
    const durationMs = Date.now() - startedAt;
    console.log({
      route: "/api/v1/repositories",
      event: "complete",
      requestId,
      durationMs,
    });
    return NextResponse.json({
      query,
      analysis: aiResponse,
      repositories,
      usage: {
        tokensUsed: actualUsage,
        remainingTokens: updatedUser.tokenBalance.total,
        requestId,
        estimate,
      },
      tier: user.tier,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in repository search:", { requestId, error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
