import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch user's API keys
    const apiKeys = await db
      .collection("apiKeys")
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Don't return the actual keys, only metadata
    const safeApiKeys = apiKeys.map((key) => ({
      id: key._id,
      name: key.name,
      keyPreview: key.keyPreview,
      tier: key.tier,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
      rateLimit: key.rateLimit,
      requestCount: key.requestCount || 0,
    }));

    return NextResponse.json(safeApiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, tier = "free" } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already has maximum number of keys for their tier
    const existingKeys = await db.collection("apiKeys").countDocuments({
      userId: new ObjectId(session.user.id),
      isActive: true,
    });

    const maxKeys = tier === "free" ? 2 : tier === "developer" ? 5 : 10;
    if (existingKeys >= maxKeys) {
      return NextResponse.json(
        { error: `Maximum ${maxKeys} API keys allowed for ${tier} tier` },
        { status: 400 }
      );
    }

    // Generate API key
    const keyId = nanoid(8);
    const keySecret = nanoid(32);
    const apiKey = `cn_${tier}_${keyId}_${keySecret}`;

    // Hash the key for storage
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Set rate limits based on tier
    const rateLimits = {
      free: { requests: 1000, window: "month" },
      developer: { requests: 50000, window: "month" },
      business: { requests: 500000, window: "month" },
      enterprise: { requests: -1, window: "month" }, // Unlimited
    };

    const newApiKey = {
      userId: new ObjectId(session.user.id),
      name: name.trim(),
      hashedKey,
      keyPreview: `cn_${tier}_${keyId}_${"*".repeat(8)}`,
      tier,
      rateLimit: rateLimits[tier as keyof typeof rateLimits],
      requestCount: 0,
      isActive: true,
      createdAt: new Date(),
      lastUsed: null,
    };

    const result = await db.collection("apiKeys").insertOne(newApiKey);

    return NextResponse.json({
      id: result.insertedId,
      apiKey, // Return the actual key only once
      name: newApiKey.name,
      tier: newApiKey.tier,
      keyPreview: newApiKey.keyPreview,
      rateLimit: newApiKey.rateLimit,
      message:
        "API key created successfully. Make sure to copy it now - you won't be able to see it again!",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = await request.json();

    if (!keyId) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Soft delete - mark as inactive
    const result = await db.collection("apiKeys").updateOne(
      {
        _id: new ObjectId(keyId),
        userId: new ObjectId(session.user.id),
      },
      {
        $set: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "API key deactivated successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
