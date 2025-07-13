import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-utils";
import { generateMessage } from "@/lib/ai";
import { getCachedData, cacheData } from "@/lib/redis";
import { consumeTokens, getUserWithTier } from "@/lib/user-tiers";
import crypto from "crypto";

// GitHub User Profile Fetcher
async function getGitHubUserProfile(username: string) {
  console.log(`[DEBUG] Getting GitHub profile for username: ${username}`);
  try {
    console.log(`[DEBUG] Fetching user data from GitHub API for ${username}`);
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    console.log(
      `[DEBUG] GitHub user API response status: ${userResponse.status}`
    );
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const user = await userResponse.json();
    console.log(`[DEBUG] Retrieved user data for ${username}`);

    // Get user's repositories
    console.log(`[DEBUG] Fetching repositories for ${username}`);
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    console.log(
      `[DEBUG] GitHub repos API response status: ${reposResponse.status}`
    );
    const repos = reposResponse.ok ? await reposResponse.json() : [];
    console.log(
      `[DEBUG] Retrieved ${repos.length} repositories for ${username}`
    );

    // Get user's recent activity (events)
    console.log(`[DEBUG] Fetching recent events for ${username}`);
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    console.log(
      `[DEBUG] GitHub events API response status: ${eventsResponse.status}`
    );
    const events = eventsResponse.ok ? await eventsResponse.json() : [];
    console.log(`[DEBUG] Retrieved ${events.length} events for ${username}`);

    console.log(`[DEBUG] Preparing profile data response for ${username}`);
    return {
      profile: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        email: user.email,
        blog: user.blog,
        twitter_username: user.twitter_username,
        public_repos: user.public_repos,
        public_gists: user.public_gists,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
      },
      repositories: repos.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        topics: repo.topics,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
      })),
      recent_activity: events.slice(0, 5).map((event: any) => ({
        type: event.type,
        repo: event.repo?.name,
        created_at: event.created_at,
        public: event.public,
      })),
    };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log("[DEBUG] POST request to /api/v1/ai-connect/profile");
  try {
    // Validate API key and consume tokens
    const apiKey = req.headers.get("x-api-key");
    console.log(`[DEBUG] API key present: ${apiKey}`);

    if (!apiKey) {
      console.log("[DEBUG] API key missing, returning 401");
      return NextResponse.json(
        { error: "API key is required. Include it in the 'x-api-key' header." },
        { status: 401 }
      );
    }

    // Estimate token consumption
    const estimatedTokens = 500;
    console.log(
      `[DEBUG] Validating API key with estimated tokens: ${estimatedTokens}`
    );
    const keyValidation = await validateApiKey(apiKey, estimatedTokens);

    if (!keyValidation) {
      console.log("[DEBUG] API key validation failed, returning 401");
      return NextResponse.json(
        { error: "Invalid API key or insufficient tokens" },
        { status: 401 }
      );
    }

    const { keyRecord, usage } = keyValidation;
    console.log(
      `[DEBUG] API key validated, tier: ${keyRecord.tier}, tokens remaining: ${usage.tokensRemaining}`
    );

    console.log("[DEBUG] Parsing request body");
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      console.log("[DEBUG] Invalid username parameter, returning 400");
      return NextResponse.json(
        { error: "Username parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Remove @ symbol if present
    const cleanUsername = username.replace(/^@/, "");
    console.log(`[DEBUG] Cleaned username: ${cleanUsername}`);

    // Create cache key for this profile analysis
    const cacheKey = `api:ai-connect:profile:${crypto
      .createHash("md5")
      .update(cleanUsername)
      .digest("hex")}`;
    console.log(`[DEBUG] Cache key: ${cacheKey}`);

    // Try to get from cache first
    console.log("[DEBUG] Checking cache");
    const cachedResponse = await getCachedData<{
      analysis: string;
      profile_data: any;
      insights: any;
    }>(cacheKey);

    if (cachedResponse) {
      console.log("[DEBUG] Cache hit, returning cached response");
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

    console.log("[DEBUG] Cache miss, fetching fresh data");

    // Fetch GitHub profile data
    let profileData;
    try {
      console.log(`[DEBUG] Fetching GitHub profile for ${cleanUsername}`);
      profileData = await getGitHubUserProfile(cleanUsername);
      console.log(
        `[DEBUG] Successfully fetched profile data for ${cleanUsername}`
      );
    } catch (error) {
      console.error(`[DEBUG] Error fetching profile: ${error}`);
      return NextResponse.json(
        {
          error: `Failed to fetch profile for @${cleanUsername}. User may not exist or profile may be private.`,
        },
        { status: 404 }
      );
    }

    // Generate AI analysis of the profile
    console.log("[DEBUG] Generating AI analysis");
    const { aiResponse: aiAnalysis, tokensUsed: aiTokensUsed } =
      await generateMessage(
        `
            You are an AI assistant that provides detailed analysis of developer profiles.
            Analyze this GitHub profile and provide insights about:
            1. Developer's expertise and skills (based on repositories)
            2. Activity level and engagement
            3. Popular projects and their impact
            4. Professional background and experience
            5. Collaboration patterns (followers, following, contributions)
            
            Profile Data:
            - Name: ${profileData.profile.name || "Not provided"}
            - Bio: ${profileData.profile.bio || "Not provided"}
            - Company: ${profileData.profile.company || "Not provided"}
            - Location: ${profileData.profile.location || "Not provided"}
            - Public Repositories: ${profileData.profile.public_repos}
            - Followers: ${profileData.profile.followers}
            - Following: ${profileData.profile.following}
            - Account Age: ${profileData.profile.created_at}
            
            Top Repositories:
            ${profileData.repositories
              .slice(0, 5)
              .map(
                (repo: any) =>
                  `- ${repo.name} (${repo.language || "Unknown"}) - ${
                    repo.stargazers_count
                  } stars - ${repo.description || "No description"}`
              )
              .join("\n")}
            
            Provide a professional, insightful analysis suitable for API consumption.
            Focus on technical skills, project impact, and professional characteristics.
            
            DO NOT include JSON formatting, code blocks, or markdown. Just provide a clean, informative analysis.
            `
      );
    console.log("[DEBUG] AI analysis generated");

    // Clean up the AI response
    console.log("[DEBUG] Cleaning AI response");
    const cleanAnalysis = aiAnalysis
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\{[\s\S]*\}$/g, "")
      .replace(/\n/g, " ")
      .trim();

    // Generate structured insights
    console.log("[DEBUG] Generating insights");
    const languages = profileData.repositories
      .map((repo: any) => repo.language)
      .filter((lang: string) => lang)
      .reduce((acc: any, lang: string) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {});

    const totalStars = profileData.repositories.reduce(
      (sum: number, repo: any) => sum + repo.stargazers_count,
      0
    );
    console.log(`[DEBUG] Total stars: ${totalStars}`);

    const insights = {
      primary_languages: Object.entries(languages)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, repositories: count })),
      total_stars: totalStars,
      most_starred_repo:
        profileData.repositories.length > 0
          ? {
              name: profileData.repositories[0].name,
              stars: profileData.repositories[0].stargazers_count,
              description: profileData.repositories[0].description,
              language: profileData.repositories[0].language,
            }
          : null,
      activity_level: profileData.recent_activity.length > 0 ? "Active" : "Low",
      follower_ratio:
        profileData.profile.followers > 0
          ? (
              profileData.profile.following / profileData.profile.followers
            ).toFixed(2)
          : "N/A",
      account_age_years: Math.floor(
        (new Date().getTime() -
          new Date(profileData.profile.created_at).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      ),
      repository_activity: {
        total_repositories: profileData.profile.public_repos,
        repositories_with_stars: profileData.repositories.filter(
          (r: any) => r.stargazers_count > 0
        ).length,
        avg_stars_per_repo:
          profileData.repositories.length > 0
            ? (totalStars / profileData.repositories.length).toFixed(1)
            : 0,
      },
    };
    console.log("[DEBUG] Insights generated");

    // Calculate total tokens used and consume them
    const totalTokensUsed = aiTokensUsed;
    console.log(`[DEBUG] Total tokens used: ${totalTokensUsed}`);

    // Check if user has sufficient tokens before consuming
    const currentUser = await getUserWithTier(keyRecord.userId);
    if (!currentUser || currentUser.tokenBalance.total < totalTokensUsed) {
      console.log(
        `[DEBUG] Insufficient tokens: need ${totalTokensUsed}, have ${
          currentUser?.tokenBalance.total || 0
        }`
      );
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
    console.log(`[DEBUG] Consuming ${totalTokensUsed} tokens`);
    const consumptionResult = await consumeTokens(
      keyRecord.userId,
      totalTokensUsed
    );
    if (!consumptionResult.success) {
      console.log(
        `[DEBUG] Token consumption failed: ${consumptionResult.error}`
      );
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
    console.log(`[DEBUG] Updated usage: ${JSON.stringify(updatedUsage)}`);

    const responseData = {
      analysis: cleanAnalysis,
      profile_data: profileData,
      insights: insights,
      metadata: {
        username: cleanUsername,
        analyzed_at: new Date().toISOString(),
        data_freshness: "Live from GitHub API",
      },
    };

    // Cache the response for 1 hour (profiles don't change frequently)
    console.log("[DEBUG] Caching response data");
    await cacheData(cacheKey, responseData, 60 * 60);

    console.log("[DEBUG] Returning response");
    return NextResponse.json({
      ...responseData,
      usage: updatedUsage,
    });
  } catch (error) {
    console.error("Error in AI-Connect Profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation
export async function GET(req: NextRequest) {
  console.log("[DEBUG] GET request to /api/v1/ai-connect/profile");
  const apiKey = req.headers.get("x-api-key");
  console.log(`[DEBUG] API key present: ${!!apiKey}`);

  if (!apiKey) {
    console.log("[DEBUG] No API key, returning public documentation");
    return NextResponse.json({
      name: "AI-Connect Profile Analysis API",
      description: "Get AI-powered analysis of GitHub developer profiles",
      version: "1.0.0",
      documentation: {
        endpoint: "POST /api/v1/ai-connect/profile",
        authentication: "Include your API key in the 'x-api-key' header",
        parameters: {
          username:
            "string (required) - GitHub username to analyze (with or without @ symbol)",
          options: {
            include_private:
              "boolean (optional) - Include private repository analysis (requires GitHub token)",
          },
        },
        examples: [
          "Get detailed analysis of @octocat",
          "Analyze developer expertise for @torvalds",
          "Profile insights for @gaearon",
        ],
      },
    });
  }

  // If API key is provided, return user-specific info
  console.log("[DEBUG] Validating API key");
  const keyValidation = await validateApiKey(apiKey);

  if (!keyValidation) {
    console.log("[DEBUG] Invalid API key, returning 401");
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { keyRecord, usage } = keyValidation;
  console.log(
    `[DEBUG] API key validated, tier: ${keyRecord.tier}, tokens remaining: ${usage.tokensRemaining}`
  );

  console.log("[DEBUG] Returning user-specific API information");
  return NextResponse.json({
    message: "AI-Connect Profile Analysis API is ready",
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
