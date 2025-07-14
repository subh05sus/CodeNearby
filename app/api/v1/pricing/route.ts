import { NextResponse } from "next/server";
import { TOKEN_PACKAGES, USER_TIERS } from "@/lib/user-tiers";

export async function GET() {
  try {
    // Convert USER_TIERS object to array format for API response
    const tiers = Object.entries(USER_TIERS).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      dailyTokens: value.dailyTokens,
      maxApiKeys: value.maxApiKeys,
      features: value.features,
      support: value.support,
      analytics: value.analytics,
      repositorySearch: value.repositorySearch,
      prioritySupport: value.prioritySupport,
    }));

    const response = {
      success: true,
      data: {
        tiers,
        tokenPackages: TOKEN_PACKAGES.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          tokens: pkg.tokens,
          bonus: pkg.bonus,
          totalTokens: pkg.tokens + pkg.bonus,
          price: pkg.price,
          features: pkg.features,
          popular: pkg.popular,
        })),
        apiEndpoints: [
          {
            endpoint: "/api/v1/developers",
            method: "POST",
            tokenCost: "500-2000",
            description: "AI-powered developer search",
          },
          {
            endpoint: "/api/v1/profile/analyze",
            method: "POST",
            tokenCost: "300-800",
            description: "GitHub profile analysis",
          },
          {
            endpoint: "/api/v1/repositories",
            method: "POST",
            tokenCost: "200-600",
            description: "Repository search",
          },
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
