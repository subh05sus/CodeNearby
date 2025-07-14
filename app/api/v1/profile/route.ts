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

// API Key validation helper (same as in developers route)
async function validateApiKey(apiKey: string) {
  if (!apiKey) {
    return { valid: false, error: "API key is required", status: 401 };
  }

  const client = await clientPromise;
  const db = client.db();
  const apiKeysCollection = db.collection("apiKeys");
  const usersCollection = db.collection("users");

  // Hash the provided API key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  // Find the API key
  const apiKeyDoc = await apiKeysCollection.findOne({
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

    // Check if user has access to profile analysis
    if (!user.features.profileAnalysis) {
      return NextResponse.json(
        { error: "Profile analysis not available in your tier" },
        { status: 403 }
      );
    }

    // Parse request body
    const { username } = await request.json();

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // Generate AI prompt for profile analysis
    const aiPrompt = `You are an AI assistant that analyzes GitHub developer profiles. 

GitHub Username: "${username}"

Please provide a comprehensive analysis of this developer's profile including:

1. **Expertise Assessment:**
   - Primary programming languages and technologies
   - Areas of specialization
   - Skill level indicators

2. **Activity Level Analysis:**
   - Contribution patterns
   - Project involvement
   - Community engagement

3. **Project Impact Evaluation:**
   - Repository quality and popularity
   - Contribution significance
   - Technical leadership indicators

4. **Professional Background Insights:**
   - Career level estimation
   - Industry focus areas
   - Collaboration patterns

5. **Recommendations:**
   - Best projects to review
   - Potential collaboration opportunities
   - Hiring suitability for different roles

Please provide a detailed, professional analysis that would be valuable for technical recruiters, hiring managers, or potential collaborators.

Note: This is a simulated analysis for demonstration purposes. In production, this would integrate with GitHub's API to fetch real profile data.`;

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
      username,
      analysis: aiResponse,
      usage: {
        tokensUsed,
        remainingTokens: updatedUser.tokenBalance.total,
        requestId: `profile_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      },
      tier: user.tier,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in profile analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
