import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function checkApiKey() {
  try {
    await client.connect();
    const db = client.db("test");

    // The API key from the request
    const apiKey = "cn_free_kt3kJxEX_DKkiSpQHIxaTCkchtDgRyYk_tL1gq_GC";
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    console.log("Looking for API key:", apiKey);
    console.log("Hashed key:", hashedKey);

    // Check if this exact API key exists
    const exactMatch = await db.collection("apiKeys").findOne({
      hashedKey,
      isActive: true,
    });

    if (exactMatch) {
      console.log("✅ Exact match found:", exactMatch);
    } else {
      console.log("❌ No exact match found");

      // Let's see what API keys actually exist
      const allKeys = await db.collection("apiKeys").find({}).toArray();
      console.log("All API keys in database:");

      for (const key of allKeys) {
        console.log({
          id: key._id,
          preview: key.keyPreview,
          hashedKey: key.hashedKey.substring(0, 20) + "...",
          isActive: key.isActive,
          userId: key.userId,
          tier: key.tier,
        });
      }

      // Let's check if there's a pattern match with the preview
      const previewMatch = await db.collection("apiKeys").findOne({
        keyPreview: apiKey.substring(0, 20) + "...",
      });

      if (previewMatch) {
        console.log("🔍 Found API key with matching preview:", previewMatch);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkApiKey();
