import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user's API keys
    const apiKeys = await db
      .collection("apiKeys")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Get user data for limits
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can create more keys
    const maxKeys = user.maxApiKeys || 1;
    const currentKeys = apiKeys.length;
    const canCreate = currentKeys < maxKeys;

    // Format API keys for response
    const formattedKeys = apiKeys.map((key) => ({
      id: key._id.toString(),
      name: key.name,
      keyPreview: `${key.key.substring(0, 8)}...${key.key.slice(-4)}`,
      tier: user.tier || "free",
      createdAt: key.createdAt,
      lastUsed: key.lastUsed || null,
      isActive: key.isActive !== false,
    }));

    return NextResponse.json({
      keys: formattedKeys,
      canCreate,
      reason: canCreate
        ? undefined
        : `Maximum ${maxKeys} API keys allowed for ${user.tier || "free"} tier`,
      current: currentKeys,
      max: maxKeys,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user data for limits
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check current API key count
    const currentKeys = await db
      .collection("apiKeys")
      .countDocuments({ userId: new ObjectId(session.user.id) });

    const maxKeys = user.maxApiKeys || 1;
    if (currentKeys >= maxKeys) {
      return NextResponse.json(
        {
          error: `Maximum ${maxKeys} API keys allowed for ${
            user.tier || "free"
          } tier`,
        },
        { status: 403 }
      );
    }

    // Generate API key
    const prefix = "cnb_";
    const keyBody = crypto.randomBytes(24).toString("hex");
    const timestamp = Date.now().toString(36);
    const apiKey = `${prefix}${keyBody}_${timestamp}`;
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Save to database
    const result = await db.collection("apiKeys").insertOne({
      userId: new ObjectId(session.user.id),
      name: name.trim(),
      key: apiKey, // Store original for response
      hashedKey, // Store hashed for validation
      keyHash: hashedKey,
      createdAt: new Date(),
      lastUsed: null,
      isActive: true,
    });

    // Update user API key count
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { apiKeyCount: currentKeys + 1 } }
      );

    return NextResponse.json({
      success: true,
      apiKey, // Return the full key only once
      keyId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Delete the API key
    const result = await db.collection("apiKeys").deleteOne({
      _id: new ObjectId(keyId),
      userId: new ObjectId(session.user.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Update user API key count
    const currentKeys = await db
      .collection("apiKeys")
      .countDocuments({ userId: new ObjectId(session.user.id) });

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: { apiKeyCount: currentKeys } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
