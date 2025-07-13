import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

const client = new MongoClient(uri);

async function diagnoseTokenIssue() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("test");

    // Check the specific API key
    const apiKey = "cn_free_kt3kJxEX_DKkiSpQHIxaTCkchtDgRyYk_tL1gq_GC";
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    console.log(
      "Looking for API key with hash:",
      hashedKey.substring(0, 20) + "..."
    );

    const keyRecord = await db.collection("apiKeys").findOne({
      hashedKey,
      isActive: true,
    });

    if (!keyRecord) {
      console.log("❌ API key not found or inactive");

      // Let's see what API keys exist
      const allKeys = await db
        .collection("apiKeys")
        .find({})
        .limit(5)
        .toArray();
      console.log(
        "Sample API keys in database:",
        allKeys.map((k) => ({
          id: k._id,
          preview: k.keyPreview,
          isActive: k.isActive,
          userId: k.userId,
        }))
      );

      return;
    }

    console.log("✅ API key found:", {
      id: keyRecord._id,
      userId: keyRecord.userId,
      tier: keyRecord.tier,
      isActive: keyRecord.isActive,
    });

    // Check the user
    const user = await db.collection("users").findOne({
      _id: keyRecord.userId,
    });

    if (!user) {
      console.log("❌ User not found for API key");
      return;
    }

    console.log("✅ User found:", {
      id: user._id,
      email: user.email,
      tier: user.tier,
      hasTokenBalance: !!user.tokenBalance,
      tokenBalance: user.tokenBalance,
    });

    if (!user.tokenBalance) {
      console.log("🔧 User missing token balance, let's fix this...");

      // Initialize token balance
      const tokenBalance = {
        purchased: 0,
        daily: 1000, // Free tier default
        total: 1000,
        lastDailyReset: new Date(),
      };

      const usage = {
        daily: {
          tokensUsed: 0,
          requests: 0,
          date: new Date().toISOString().split("T")[0],
        },
        monthly: {
          tokensUsed: 0,
          tokensPurchased: 0,
          requests: 0,
          amountSpent: { usd: 0, inr: 0 },
          month: new Date().toISOString().slice(0, 7),
        },
        lifetime: {
          tokensUsed: 0,
          tokensPurchased: 0,
          requests: 0,
          amountSpent: { usd: 0, inr: 0 },
          apiKeysCreated: 0,
        },
      };

      const limits = {
        maxApiKeys: 1,
        dailyFreeTokens: 1000,
        features: ["developer-search"],
      };

      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            tier: user.tier || "free",
            tierStatus: "active",
            tokenBalance,
            usage,
            limits,
            updatedAt: new Date(),
          },
        }
      );

      console.log("✅ User token balance initialized!");
    }
  } catch (error) {
    console.error("Diagnosis failed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the diagnosis
diagnoseTokenIssue()
  .then(() => {
    console.log("Diagnosis completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Diagnosis failed:", error);
    process.exit(1);
  });
