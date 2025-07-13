import { type NextRequest, NextResponse } from "next/server";
import { searchGitHubUsersBasic } from "@/lib/github-search";
import { cacheData, getCachedData } from "@/lib/redis";
import { generateMessage } from "@/lib/ai";
import { validateApiKey } from "@/lib/api-utils";
import { consumeTokens, getUserWithTier } from "@/lib/user-tiers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Validate API key and consume tokens
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Include it in the 'x-api-key' header." },
        { status: 401 }
      );
    }

    // Validate API key without consuming tokens (we'll consume actual tokens used)
    const estimatedTokens = 500; // Estimate the tokens needed for this request
    const keyValidation = await validateApiKey(apiKey, estimatedTokens);

    if (!keyValidation) {
      return NextResponse.json(
        { error: "Invalid API key or insufficient tokens" },
        { status: 401 }
      );
    }

    const { keyRecord } = keyValidation;

    const { query, options = {} } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Create cache key for this query
    const cacheKey = `api:ai-connect:${crypto
      .createHash("md5")
      .update(query)
      .digest("hex")}`;

    // Try to get from cache first
    const cachedResponse = await getCachedData<{
      message: string;
      developers: any[];
      query_analysis: any;
    }>(cacheKey);

    if (cachedResponse) {
      // For cached responses, get current user token balance
      const currentUser = await getUserWithTier(keyRecord.userId);
      return NextResponse.json({
        ...cachedResponse,
        cached: true,
        usage: {
          tokens_remaining: currentUser?.tokenBalance.total || 0,
          tokens_used_this_request: 0, // No tokens consumed for cached response
          tier: keyRecord.tier,
        },
      });
    }

    // Analyze the query using AI
    const { aiResponse: aiAnalysis, tokensUsed: analysisTokensUsed } =
      await generateMessage(
        `
      You are an AI assistant that analyzes developer search queries.
      Analyze this query and extract the following information:
      1. Skills or technologies mentioned (e.g., React, Python, Machine Learning)
      2. Location mentioned (e.g., New York, San Francisco, remote)
      3. Experience level (e.g., senior, junior, beginner)
      4. Other requirements (e.g., company size, project type)
      
      Format your response as JSON with the following structure:
      {
        "skills": ["skill1", "skill2"],
        "location": "location name or null if not specified",
        "experience_level": "senior/junior/mid-level or null if not specified",
        "other_requirements": ["requirement1", "requirement2"],
        "search_intent": "brief description of what the user is looking for"
      }
      
      Query: ${query}
      `
      );

    let parsedAnalysis;
    try {
      const analysisMatch =
        aiAnalysis.match(/```json\n([\s\S]*?)\n```/) ||
        aiAnalysis.match(/{[\s\S]*?}/);
      parsedAnalysis = analysisMatch
        ? JSON.parse(analysisMatch[1] || analysisMatch[0])
        : {
            skills: [],
            location: null,
            experience_level: null,
            other_requirements: [],
            search_intent: query,
          };
    } catch (e) {
      console.error("Failed to parse AI analysis:", e);
      parsedAnalysis = {
        skills: [],
        location: null,
        experience_level: null,
        other_requirements: [],
        search_intent: query,
      };
    }

    // Search for developers based on the analysis
    const { location, skills } = parsedAnalysis;
    let developers: any[] = [];

    if (location || skills.length > 0) {
      const maxResults =
        options.limit ||
        (keyRecord.tier === "free"
          ? 10
          : keyRecord.tier === "verified"
          ? 50
          : 100);
      developers = await searchGitHubUsersBasic(location, skills);
      // Limit results based on tier
      developers = developers.slice(0, maxResults);
    }

    // Generate AI response
    const { aiResponse, tokensUsed: responseTokensUsed } =
      await generateMessage(
        `
      You are an AI assistant helping developers find other developers via API.
      Based on the search query: "${query}"
      
      Analysis results:
      - Skills: ${skills.join(", ") || "Not specified"}
      - Location: ${location || "Not specified"}
      - Experience level: ${parsedAnalysis.experience_level || "Not specified"}
      
      ${
        developers.length > 0
          ? `I found ${developers.length} developers that match the criteria.`
          : "I couldn't find any developers matching the specific criteria."
      }
      
      Provide a SIMPLE, CLEAN message (just plain text, no JSON formatting) suitable for API consumption.
      Focus on the search results and be helpful about next steps.
      
      Example good responses:
      - "Found 5 React Native developers in New York. Consider checking their GitHub profiles for more details."
      - "Located 12 Python developers specializing in machine learning. You can contact them through their GitHub profiles."
      - "No developers found matching your specific criteria. Try broadening your search or removing location constraints."
      
      DO NOT include JSON formatting, code blocks, or markdown. Just provide a clean, helpful message.
      `
      );

    // Calculate total tokens used and consume them
    const totalTokensUsed = analysisTokensUsed + responseTokensUsed;

    // Check if user has sufficient tokens before consuming
    const currentUser = await getUserWithTier(keyRecord.userId);
    if (!currentUser || currentUser.tokenBalance.total < totalTokensUsed) {
      return NextResponse.json(
        {
          error: `Insufficient tokens. Need ${totalTokensUsed}, have ${
            currentUser?.tokenBalance.total || 0
          }`,
        },
        { status: 402 }
      );
    }

    // Consume the actual tokens used
    const consumptionResult = await consumeTokens(
      keyRecord.userId,
      totalTokensUsed
    );
    if (!consumptionResult.success) {
      return NextResponse.json(
        { error: consumptionResult.error || "Failed to consume tokens" },
        { status: 402 }
      );
    }

    // Get updated user data for response
    const updatedUser = await getUserWithTier(keyRecord.userId);
    const updatedUsage = {
      tokens_remaining: updatedUser?.tokenBalance.total || 0,
      tokens_used_this_request: totalTokensUsed,
      tier: keyRecord.tier,
    };

    // Clean up the AI response - remove any JSON formatting, code blocks, or unwanted characters
    const cleanMessage = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\{[\s\S]*\}$/g, "") // Remove if entire response is JSON
      .replace(/\n/g, " ")
      .trim();

    const responseData = {
      message: cleanMessage,
      developers: developers.slice(0, options.limit || 20),
      query_analysis: parsedAnalysis,
      metadata: {
        total_results: developers.length,
        search_query: query,
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the response
    await cacheData(cacheKey, responseData, 60 * 30); // Cache for 30 minutes

    return NextResponse.json({
      ...responseData,
      usage: updatedUsage,
    });
  } catch (error) {
    console.error("Error in AI-Connect API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation and testing
export async function GET(req: NextRequest) {
  const requestApiKey = req.headers.get("x-api-key");

  if (!requestApiKey) {
    return NextResponse.json({
      name: "AI-Connect Developer Search API",
      description:
        "Find developers using natural language queries powered by AI",
      version: "1.0.0",
      documentation: {
        endpoint: "POST /api/v1/ai-connect/developers",
        authentication: "Include your API key in the 'x-api-key' header",
        parameters: {
          query: {
            type: "string",
            required: true,
            description:
              "Natural language query describing the developers you're looking for",
            examples: [
              "Find React Native developers in New York",
              "Looking for senior Python developers who work with machine learning",
              "Find JavaScript developers interested in blockchain",
            ],
          },
          options: {
            type: "object",
            required: false,
            properties: {
              limit: {
                type: "number",
                description:
                  "Maximum number of results to return (free: 10, developer: 50, business: 100)",
              },
            },
          },
        },
        response: {
          message: "AI-generated response about the search",
          developers: "Array of matching developer profiles",
          query_analysis: "AI analysis of the search query",
          metadata: "Search metadata including timestamp and result count",
          usage: "API usage information",
        },
        examples: {
          request: {
            query: "Find React developers in San Francisco",
            options: { limit: 5 },
          },
        },
      },
      rate_limits: {
        free: "100 requests/hour, 1,000 requests/month",
        developer: "1,000 requests/hour, 50,000 requests/month",
        business: "5,000 requests/hour, 500,000 requests/month",
        enterprise: "Unlimited",
      },
    });
  }

  // If API key is provided, return usage stats
  if (requestApiKey) {
    const keyValidation = await validateApiKey(requestApiKey);
    if (!keyValidation) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const { keyRecord, usage } = keyValidation;

    return NextResponse.json({
      api_key_status: "valid",
      tier: keyRecord.tier,
      usage: {
        tokens_remaining: usage.tokensRemaining,
        tokens_used: usage.tokensUsed,
        daily_free_tokens: usage.dailyFreeTokens,
        purchased_tokens: usage.purchasedTokens,
        last_used: keyRecord.lastUsed,
      },
    });
  }

  return NextResponse.json({
    name: "AI-Connect Developer Search API",
    description: "Find developers using natural language queries powered by AI",
    version: "1.0.0",
    documentation: {
      endpoint: "POST /api/v1/ai-connect/developers",
      authentication: "Include your API key in the 'x-api-key' header",
    },
  });
}
