import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  UserRecord,
  canConsumeTokens,
  consumeTokens,
  shouldResetDailyTokens,
  resetDailyTokens,
} from "@/lib/user-tiers";
import { getEstimatedTokenCost } from "@/consts/pricing";
import { generateMessage } from "@/lib/ai";
import { searchGitHubUsersBasic } from "@/lib/github-search";
import crypto from "crypto";
import { ObjectId } from "mongodb";

// Use AI to extract features (location and skills) from the natural query.
// Returns structured features and tokens used for extraction.
async function extractSearchFeatures({
  query,
  location,
}: {
  query: string;
  location?: string | null;
}): Promise<{
  location: string | null;
  skills: string[];
  tokensUsedForExtract: number;
  raw?: string;
}> {
  const cleanedQuery = (query || "").trim();
  const hintLocation = location ? String(location).trim() : "";
  const prompt = `Extract search features for finding GitHub developers.

Input:
- query: ${JSON.stringify(cleanedQuery)}
- locationHint: ${JSON.stringify(hintLocation || null)}

Return ONLY compact JSON with keys {"location": string|null, "skills": string[]}.
- location should be a city/state/country or null.
- skills should be 1-6 concise keywords (e.g., ["typescript","react","node"]).
- Do not include extra text.`;

  try {
    const res = await generateMessage(prompt);
    const text = String(res.aiResponse || "").trim();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Attempt to extract JSON substring
      const m = text.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    const loc =
      typeof parsed?.location === "string" && parsed.location.trim()
        ? parsed.location.trim()
        : null;
    const skillsArr = Array.isArray(parsed?.skills)
      ? parsed.skills
          .filter((s: any) => typeof s === "string" && s.trim())
          .map((s: string) => s.trim())
          .slice(0, 6)
      : [];
    return {
      location: loc || hintLocation || null,
      skills: skillsArr,
      tokensUsedForExtract: Number(res.tokensUsed || 0),
      raw: text,
    };
  } catch {
    // Fallback basic keyword extraction
    const tokens = cleanedQuery.split(/[^a-zA-Z0-9#+.\-]/).filter(Boolean);
    const stop = new Set([
      "find",
      "developer",
      "developers",
      "in",
      "at",
      "the",
      "a",
      "an",
      "and",
      "or",
      "for",
      "with",
      "of",
    ]);
    const skills = tokens
      .filter((t) => !stop.has(t.toLowerCase()) && t.length > 1)
      .slice(0, 5);
    return { location: hintLocation || null, skills, tokensUsedForExtract: 0 };
  }
}

// API Key validation helper
async function validateApiKey(apiKey: string) {
  if (!apiKey) {
    return { valid: false, error: "API key is required", status: 401 };
  }

  const client = await clientPromise;
  const db = client.db("test");
  const apiKeysCollection = db.collection("apiKeys");
  const usersCollection = db.collection("users");

  // Hash the provided API key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  // Find the API key
  const apiKeyDoc = await db.collection("apiKeys").findOne({
    hashedKey: keyHash,
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
  try {
    const requestId = `dev_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const startedAt = Date.now();

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

    // Check if user has access to developer search
    if (!user.features.developerSearch) {
      return NextResponse.json(
        { error: "Developer search not available in your tier" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const query: string = body?.query;
    const location: string | undefined = body?.location;
    const limitRaw: any = body?.limit;
    const limit: number | null =
      typeof limitRaw === "number"
        ? limitRaw
        : typeof limitRaw === "string" && limitRaw.trim()
        ? parseInt(limitRaw, 10)
        : null;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Estimate and pre-check tokens for two AI calls (extract + summary)
    const estimateSingle = getEstimatedTokenCost("/api/v1/developers").average;
    const combinedEstimate = Math.ceil(estimateSingle * 2);
    if (!canConsumeTokens(user, combinedEstimate)) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: combinedEstimate,
          available: user.tokenBalance.total,
          message: "Please purchase more tokens to continue using the API",
          estimate: combinedEstimate,
        },
        { status: 402 }
      );
    }

    // 1) Extract features using AI
    const {
      location: extractedLocation,
      skills,
      tokensUsedForExtract,
      raw,
    } = await extractSearchFeatures({
      query,
      location,
    });

    const basicResults = await searchGitHubUsersBasic(
      extractedLocation,
      skills
    );
    const developers = Array.isArray(basicResults) ? basicResults : [];
    const limitedDevs =
      typeof limit === "number" && limit > 0
        ? developers.slice(0, limit)
        : developers;

    // Generate AI prompt to summarize fetched developers
    const compactUsers = limitedDevs.slice(0, 20).map((u: any) => ({
      login: u.login,
      url: u.html_url,
      score: (u as any).score,
    }));
    const aiPrompt = `You are an AI assistant summarizing GitHub user search results.

User Query: ${JSON.stringify(query)}
Extracted Location: ${JSON.stringify(extractedLocation)}
Extracted Skills: ${JSON.stringify(skills)}
Candidates Count: ${limitedDevs.length}
Candidates (sample up to 20): ${JSON.stringify(compactUsers)}

Tasks:
- Summarize the overall profile of these candidates (skills, tech, seniority hints).
- Suggest 3-5 concrete refinements to improve future searches.
- List up to 5 promising usernames.

Keep the response concise and actionable.`;

    const { aiResponse, tokensUsed: tokensUsedForSummary } =
      await generateMessage(aiPrompt);

    // Check if user has enough tokens
    const totalTokensUsed =
      (tokensUsedForExtract || 0) + (tokensUsedForSummary || 0);
    if (!canConsumeTokens(user, totalTokensUsed)) {
      return NextResponse.json(
        {
          error: "Insufficient tokens",
          required: totalTokensUsed,
          available: user.tokenBalance.total,
          message: "Please purchase more tokens to continue using the API",
        },
        { status: 402 }
      );
    }

    // Consume tokens (use actual usage if provided; fallback to estimate)
    const actualUsage =
      totalTokensUsed && totalTokensUsed > 0
        ? totalTokensUsed
        : combinedEstimate;
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

    // Return successful response
    const durationMs = Date.now() - startedAt;
    console.log({
      route: "/api/v1/developers",
      event: "complete",
      requestId,
      durationMs,
    });
    return NextResponse.json({
      query,
      analysis: aiResponse,
      developers: limitedDevs,
      extracted: { location: extractedLocation, skills, raw },
      usage: {
        tokensUsed: actualUsage,
        remainingTokens: updatedUser.tokenBalance.total,
        requestId,
        estimate: combinedEstimate,
      },
      tier: user.tier,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in developer search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
