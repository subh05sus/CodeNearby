import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-utils";
import { generateMessage } from "@/lib/ai";
import { getCachedData, cacheData } from "@/lib/redis";
import { consumeTokens, getUserWithTier } from "@/lib/user-tiers";
import crypto from "crypto";

// GitHub Repository Search
async function searchGitHubRepositories(
  query: string,
  language?: string,
  sort: string = "stars",
  limit: number = 10
) {
  try {
    const searchParams = new URLSearchParams({
      q: `${query}${language ? ` language:${language}` : ""}`,
      sort,
      order: "desc",
      per_page: limit.toString(),
    });

    const response = await fetch(
      `https://api.github.com/search/repositories?${searchParams}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      homepage: repo.homepage,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      size: repo.size,
      default_branch: repo.default_branch,
      open_issues_count: repo.open_issues_count,
      topics: repo.topics,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        html_url: repo.owner.html_url,
        type: repo.owner.type,
      },
      license: repo.license
        ? {
            name: repo.license.name,
            spdx_id: repo.license.spdx_id,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error searching GitHub repositories:", error);
    return [];
  }
}

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
    const cacheKey = `api:ai-connect:repos:${crypto
      .createHash("md5")
      .update(query + JSON.stringify(options))
      .digest("hex")}`;

    // Try to get from cache first
    const cachedResponse = await getCachedData<{
      message: string;
      repositories: any[];
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
      You are an AI assistant that analyzes repository search queries.
      Analyze this query and extract the following information:
      1. Technologies or languages mentioned (e.g., React, Python, JavaScript)
      2. Type of project (e.g., library, framework, tool, app)
      3. Specific features or functionality mentioned
      4. Project size or popularity preferences
      
      Format your response as JSON with the following structure:
      {
        "technologies": ["tech1", "tech2"],
        "project_type": "library/framework/tool/app or null if not specified",
        "features": ["feature1", "feature2"],
        "popularity": "high/medium/low or null if not specified",
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
            technologies: [],
            project_type: null,
            features: [],
            popularity: null,
            search_intent: query,
          };
    } catch (e) {
      console.error("Failed to parse AI analysis:", e);
      parsedAnalysis = {
        technologies: [],
        project_type: null,
        features: [],
        popularity: null,
        search_intent: query,
      };
    }

    // Search for repositories based on the analysis
    const { technologies } = parsedAnalysis;
    let repositories: any[] = [];

    // Construct search query for GitHub
    const searchQuery = query;
    const limit = Math.min(
      options.limit || 20,
      keyRecord.tier === "free" ? 20 : keyRecord.tier === "verified" ? 50 : 100
    );
    const language =
      options.language ||
      (technologies.length > 0 ? technologies[0] : undefined);
    const sort = options.sort || "stars";

    repositories = await searchGitHubRepositories(
      searchQuery,
      language,
      sort,
      limit
    );

    // Generate AI response
    const { aiResponse, tokensUsed: responseTokensUsed } =
      await generateMessage(
        `
      You are an AI assistant helping developers find repositories via API.
      Based on the search query: "${query}"
      
      Analysis results:
      - Technologies: ${technologies.join(", ") || "Not specified"}
      - Project type: ${parsedAnalysis.project_type || "Not specified"}
      - Features: ${parsedAnalysis.features.join(", ") || "Not specified"}
      
      ${
        repositories.length > 0
          ? `I found ${repositories.length} repositories that match the criteria.`
          : "I couldn't find any repositories matching the specific criteria."
      }
      
      Provide a SIMPLE, CLEAN message (just plain text, no JSON formatting) suitable for API consumption.
      Focus on the search results and be helpful about next steps.
      
      Example good responses:
      - "Found 15 React Native repositories including popular ones like react-navigation and react-native-elements."
      - "Located 8 Python machine learning libraries with high star counts. Check out scikit-learn and TensorFlow."
      - "No repositories found matching your specific criteria. Try using broader search terms or different technology keywords."
      
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

    // Clean up the AI response
    const cleanMessage = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\{[\s\S]*\}$/g, "")
      .replace(/\n/g, " ")
      .trim();

    const responseData = {
      message: cleanMessage,
      repositories: repositories,
      query_analysis: parsedAnalysis,
      metadata: {
        total_results: repositories.length,
        search_query: query,
        language_filter: language,
        sort_by: sort,
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
    console.error("Error in AI-Connect Repositories API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({
      name: "AI-Connect Repository Search API",
      description:
        "Find GitHub repositories using natural language queries powered by AI",
      version: "1.0.0",
      documentation: {
        endpoint: "POST /api/v1/ai-connect/repositories",
        authentication: "Include your API key in the 'x-api-key' header",
        parameters: {
          query:
            "string (required) - Natural language description of repositories you're looking for",
          options: {
            limit:
              "number (optional) - Maximum results to return (default: 20, max varies by tier)",
            language: "string (optional) - Filter by programming language",
            sort: "string (optional) - Sort by 'stars', 'forks', 'updated' (default: 'stars')",
          },
        },
        examples: [
          "Find React UI component libraries",
          "Looking for Python machine learning frameworks",
          "Find JavaScript testing tools",
          "Search for Go microservice frameworks",
        ],
      },
    });
  }

  // If API key is provided, return user-specific info
  const keyValidation = await validateApiKey(apiKey);

  if (!keyValidation) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { keyRecord, usage } = keyValidation;

  return NextResponse.json({
    message: "AI-Connect Repository Search API is ready",
    your_tier: keyRecord.tier,
    usage: {
      tokens_remaining: usage.tokensRemaining,
      tokens_used: usage.tokensUsed,
      daily_free_tokens: usage.dailyFreeTokens,
      purchased_tokens: usage.purchasedTokens,
      tier: keyRecord.tier,
    },
  });
}
