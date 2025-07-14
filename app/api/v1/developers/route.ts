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
import crypto from "crypto";
import { ObjectId } from "mongodb";

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
  console.log({
    message: `Key hash generated: ${keyHash.substring(0, 8)}...`,
    keyHash: keyHash.substring(0, 8),
    fullKeyHash: keyHash,
  });
  // Find the API key
  const apiKeyDoc = await db.collection("apiKeys").findOne({
    hashedKey: keyHash,
    isActive: true,
  });

  console.log({
    message: `API key found, user ID: ${apiKeyDoc?.userId}`,
    apiKeyDoc,
    userId: apiKeyDoc?.userId,
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
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Generate AI prompt for developer search
    const aiPrompt = `You are an AI assistant helping to find developers based on natural language queries. 

User Query: "${query}"

Based on this query, I need you to:
1. Extract key information like technologies, location, experience level, etc.
2. Provide a structured response with matching criteria
3. Suggest relevant GitHub users or profiles

Please analyze the query and provide insights about what kind of developers the user is looking for, including:
- Technologies/skills mentioned
- Location preferences
- Experience level indicators
- Any specific requirements

Format your response as a detailed analysis followed by recommendations.`;

    // Call AI service
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

    // Consume tokens
    const updatedUser = consumeTokens(user, tokensUsed);

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
    return NextResponse.json({
      query,
      analysis: aiResponse,
      usage: {
        tokensUsed,
        remainingTokens: updatedUser.tokenBalance.total,
        requestId: `dev_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
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
