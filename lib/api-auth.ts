import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    tier: string;
    tokenBalance: any;
  };
}

export async function validateApiKey(
  request: NextRequest
): Promise<{ user: any; error?: string }> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { user: null, error: "API key is required" };
  }

  if (!apiKey.startsWith("cn_")) {
    return { user: null, error: "Invalid API key format" };
  }

  try {
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    const client = await clientPromise;
    const db = client.db();

    // Find the API key
    const apiKeyDoc = await db.collection("apiKeys").findOne({
      hashedKey,
      isActive: true,
    });

    if (!apiKeyDoc) {
      return { user: null, error: "Invalid API key" };
    }

    // Update last used timestamp
    await db
      .collection("apiKeys")
      .updateOne({ _id: apiKeyDoc._id }, { $set: { lastUsed: new Date() } });

    // Get the user associated with this API key
    const user = await db.collection("users").findOne({
      _id: apiKeyDoc.userId,
    });

    if (!user) {
      return { user: null, error: "User not found" };
    }

    return { user };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { user: null, error: "Authentication failed" };
  }
}

export function requireApiKey(
  handler: (request: NextRequest, user: any) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const { user, error } = await validateApiKey(request);

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: error || "Authentication failed" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return handler(request, user);
  };
}
