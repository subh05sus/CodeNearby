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

// API Key validation helper (same as in other routes)
async function validateApiKey(apiKey: string) {
  console.log("Starting API key validation");

  if (!apiKey) {
    console.log("API key missing in request");
    return { valid: false, error: "API key is required", status: 401 };
  }

  const client = await clientPromise;
  const db = client.db();
  const apiKeysCollection = db.collection("apiKeys");
  const usersCollection = db.collection("users");

  // Hash the provided API key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  console.log(`Key hash generated: ${keyHash.substring(0, 8)}...`);

  // Find the API key
  const apiKeyDoc = await db.collection("apiKeys").findOne({
    keyHash,
    isActive: true,
  });

  if (!apiKeyDoc) {
    console.log("API key not found or inactive");
    return { valid: false, error: "Invalid or inactive API key", status: 401 };
  }

  console.log(`API key found, user ID: ${apiKeyDoc.userId}`);

  // Get the user associated with this API key
  const user = (await usersCollection.findOne({
    _id: apiKeyDoc.userId,
  })) as UserRecord | null;

  if (!user) {
    console.log(`User not found for ID: ${apiKeyDoc.userId}`);
    return { valid: false, error: "User not found", status: 404 };
  }

  console.log(`User found: ${user._id}, tier: ${user.tier}`);

  // Update last used timestamp
  await apiKeysCollection.updateOne(
    { _id: apiKeyDoc._id },
    { $set: { lastUsed: new Date() } }
  );

  console.log("API key validation successful");
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
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Generate AI prompt for repository search
    const aiPrompt = `You are an AI assistant helping to find GitHub repositories based on natural language queries.

User Query: "${query}"

Based on this query, I need you to:
1. Analyze the search intent and extract key criteria
2. Identify relevant technologies, project types, and features
3. Provide repository recommendations and search insights

Please analyze the query and provide detailed insights about:

1. **Technology-based Search:**
   - Programming languages mentioned
   - Frameworks and libraries
   - Development tools and platforms

2. **Project Type Classification:**
   - Application type (web, mobile, desktop, etc.)
   - Purpose (library, tool, template, example, etc.)
   - Complexity level

3. **Popularity Filtering:**
   - Size and activity indicators
   - Community engagement metrics
   - Maintenance status

4. **Feature Matching:**
   - Specific functionality requirements
   - Integration capabilities
   - Performance characteristics

5. **Recommendations:**
   - Best matching repository types
   - Popular alternatives to consider
   - Search refinement suggestions

Format your response as a comprehensive analysis followed by specific repository search recommendations.

Note: This is a simulated analysis for demonstration purposes. In production, this would integrate with GitHub's search API to provide real repository results.`;

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
        requestId: `repo_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      },
      tier: user.tier,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in repository search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
