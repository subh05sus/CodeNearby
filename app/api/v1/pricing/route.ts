import { NextRequest, NextResponse } from "next/server";
import {
  getFormattedTokenPackages,
  detectUserCurrency,
  USER_TIERS,
  TOKEN_CONSUMPTION,
} from "@/lib/pricing-utils";

export async function GET(request: NextRequest) {
  try {
    // Detect user's currency based on location
    const currency = await detectUserCurrency(request);

    // Get formatted token packages
    const formattedPackages = getFormattedTokenPackages(currency);

    return NextResponse.json({
      currency,
      tokenPackages: formattedPackages,
      userTiers: USER_TIERS,
      tokenConsumption: TOKEN_CONSUMPTION,
      metadata: {
        detectionMethod: getDetectionMethod(request),
        timestamp: new Date().toISOString(),
        pricingModel: "token-based",
      },
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing information" },
      { status: 500 }
    );
  }
}

function getDetectionMethod(request: NextRequest): string {
  const countryHeader =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code");

  if (countryHeader) {
    return `header:${countryHeader}`;
  }

  return "default";
}
