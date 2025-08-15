import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import clientPromise from "@/lib/mongodb";
import { UserRecord, canCreateApiKey } from "@/lib/user-tiers";
import crypto from "crypto";
import { ObjectId } from "mongodb";

interface ApiKey {
  _id?: ObjectId;
  userId: string;
  name: string;
  keyHash: string;
  keyPreview: string;
  tier: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date | null;
}

// Generate API key
function generateApiKey(): string {
  return `cn_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Create key preview (show first 8 and last 4 characters)
function createKeyPreview(key: string): string {
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

// GET - Fetch user's API keys
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const apiKeysCollection = db.collection("apiKeys");

    // Fetch user's API keys (excluding the actual key hash)
    const apiKeys = await apiKeysCollection
      .find(
        { userId: session.user.id },
        { 
          projection: { 
            keyHash: 0  // Exclude the hash from response
          } 
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(apiKeys);

  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid API key name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    const apiKeysCollection = db.collection("apiKeys");

    // Check user's current tier and permissions
    const user = await usersCollection.findOne({ 
      _id: session.user.id 
    }) as UserRecord | null;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user can create more API keys
    const permission = canCreateApiKey(user);
    if (!permission.canCreate) {
      return NextResponse.json(
        { error: permission.reason },
        { status: 403 }
      );
    }

    // Generate new API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPreview = createKeyPreview(apiKey);

    // Create API key document
    const newApiKey: ApiKey = {
      userId: session.user.id,
      name: name.trim(),
      keyHash,
      keyPreview,
      tier: user.tier,
      isActive: true,
      createdAt: new Date(),
      lastUsed: null
    };

    // Insert API key
    const result = await apiKeysCollection.insertOne(newApiKey);

    // Update user's API key count
    await usersCollection.updateOne(
      { _id: session.user.id },
      { $inc: { apiKeyCount: 1 } }
    );

    // Return the API key (only return the actual key once)
    return NextResponse.json({
      id: result.insertedId,
      name: newApiKey.name,
      apiKey: apiKey,  // Only returned on creation
      keyPreview: newApiKey.keyPreview,
      tier: newApiKey.tier,
      createdAt: newApiKey.createdAt,
      isActive: newApiKey.isActive
    });

  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete API key
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
    const usersCollection = db.collection("users");
    const apiKeysCollection = db.collection("apiKeys");

    // Delete the API key (only if it belongs to the user)
    const deleteResult = await apiKeysCollection.deleteOne({
      _id: keyId,
      userId: session.user.id
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "API key not found or access denied" },
        { status: 404 }
      );
    }

    // Update user's API key count
    await usersCollection.updateOne(
      { _id: session.user.id },
      { $inc: { apiKeyCount: -1 } }
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
