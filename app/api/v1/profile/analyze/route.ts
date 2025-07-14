import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { consumeTokens, canConsumeTokens } from "@/lib/user-tiers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await request.json();
    if (!username) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user data
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Estimate token cost for profile analysis
    const estimatedTokens = 456; // Base cost for profile analysis

    // Check if user has enough tokens
    if (!canConsumeTokens(user as any, estimatedTokens)) {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 402 }
      );
    }

    // Fetch GitHub profile data
    const githubResponse = await fetch(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { error: "GitHub user not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch GitHub profile");
    }

    const githubUser = await githubResponse.json();

    // Get user's repositories for analysis
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
          "User-Agent": "CodeNearby-API",
        },
      }
    );

    const repos = reposResponse.ok ? await reposResponse.json() : [];

    // Analyze the profile (simplified analysis)
    const languages = repos
      .map((repo: any) => repo.language)
      .filter(Boolean)
      .reduce((acc: any, lang: string) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {});

    const topLanguages = Object.entries(languages)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang);

    const analysis = {
      expertise: topLanguages,
      strengths: generateStrengthsAnalysis(githubUser, repos),
      experience: determineExperience(githubUser, repos),
      collaboration: determineCollaboration(githubUser),
    };

    // Consume tokens and update user
    const updatedUser = consumeTokens(user as any, estimatedTokens);

    // Update user in database
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          "tokenBalance.daily": updatedUser.tokenBalance.daily,
          "tokenBalance.purchased": updatedUser.tokenBalance.purchased,
          "tokenBalance.total": updatedUser.tokenBalance.total,
          "usage.today.tokens": updatedUser.usage.today.tokens,
          "usage.today.requests": updatedUser.usage.today.requests,
          "usage.total.tokens": updatedUser.usage.total.tokens,
          "usage.total.requests": updatedUser.usage.total.requests,
        },
      }
    );

    // Prepare response
    const response = {
      success: true,
      tokensUsed: estimatedTokens,
      data: {
        profile: {
          username: githubUser.login,
          name: githubUser.name,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          publicRepos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
          createdAt: githubUser.created_at,
        },
        analysis,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error analyzing profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateStrengthsAnalysis(user: any, repos: any[]): string {
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
  const hasPopularRepos = totalStars > 50;
  const activeContributor = repos.length > 10;

  if (hasPopularRepos && activeContributor) {
    return "Strong open source contributor with popular repositories and active development";
  } else if (hasPopularRepos) {
    return "Creates popular repositories with good community engagement";
  } else if (activeContributor) {
    return "Active developer with consistent contribution patterns";
  } else {
    return "Developing programming skills with growing repository portfolio";
  }
}

function determineExperience(user: any, repos: any[]): string {
  const accountAge =
    new Date().getFullYear() - new Date(user.created_at).getFullYear();
  const repoCount = repos.length;

  if (accountAge >= 5 && repoCount >= 20) {
    return "5+ years";
  } else if (accountAge >= 3 && repoCount >= 10) {
    return "3-5 years";
  } else if (accountAge >= 1 && repoCount >= 5) {
    return "1-3 years";
  } else {
    return "< 1 year";
  }
}

function determineCollaboration(user: any): string {
  const followersCount = user.followers;
  const followingCount = user.following;

  if (followersCount > 100 && followingCount > 50) {
    return "Excellent";
  } else if (followersCount > 50 || followingCount > 25) {
    return "Good";
  } else {
    return "Developing";
  }
}
