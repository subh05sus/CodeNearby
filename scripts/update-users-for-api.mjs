#!/usr/bin/env node
/**
 * Script to update all existing users with API-related fields
 * Run with: node scripts/update-users-for-api.js
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function updateUsersForAPI() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Get current timestamp for createdAt dates
    const now = new Date();

    // Define the update for existing users
    const updateFields = {
      $set: {
        // API Access & Billing
        tier: "free",
        dailyTokens: 1000,
        dailyTokensResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reset tomorrow
        purchasedTokens: 0,
        totalTokensUsed: 0,

        // Timestamps
        createdAt: now,
        lastActiveAt: now,

        // API Usage Tracking
        apiUsage: {
          dailyRequestCount: 0,
          totalRequestCount: 0,
          lastRequestAt: null,
        },
      },
      $setOnInsert: {
        // Only add if field doesn't exist
        updatedAt: now,
      },
    };

    // Update all existing users
    const result = await usersCollection.updateMany({}, updateFields);

    console.log(`✅ Updated ${result.modifiedCount} users with API fields`);

    // Create indexes for API-related fields
    await usersCollection.createIndex({ tier: 1 });
    await usersCollection.createIndex({ dailyTokensResetAt: 1 });
    await usersCollection.createIndex({ createdAt: 1 });
    await usersCollection.createIndex({ lastActiveAt: 1 });

    console.log("✅ Created indexes for API fields");

    // Create apiKeys collection if it doesn't exist
    const apiKeysCollection = db.collection("apiKeys");

    // Create indexes for apiKeys collection
    await apiKeysCollection.createIndex({ hashedKey: 1 }, { unique: true });
    await apiKeysCollection.createIndex({ userId: 1 });
    await apiKeysCollection.createIndex({ isActive: 1 });
    await apiKeysCollection.createIndex({ lastUsedAt: 1 });
    await apiKeysCollection.createIndex({ createdAt: 1 });

    console.log("✅ Created apiKeys collection with indexes");

    // Create billing collection for transaction history
    const billingCollection = db.collection("billing");

    await billingCollection.createIndex({ userId: 1 });
    await billingCollection.createIndex({ createdAt: 1 });
    await billingCollection.createIndex({ type: 1 });
    await billingCollection.createIndex({ status: 1 });

    console.log("✅ Created billing collection with indexes");

    // Create apiUsage collection for detailed usage tracking
    const apiUsageCollection = db.collection("apiUsage");

    await apiUsageCollection.createIndex({ userId: 1 });
    await apiUsageCollection.createIndex({ apiKeyId: 1 });
    await apiUsageCollection.createIndex({ timestamp: 1 });
    await apiUsageCollection.createIndex({ endpoint: 1 });

    console.log("✅ Created apiUsage collection with indexes");

    console.log("🎉 All users updated successfully for API functionality!");
  } catch (error) {
    console.error("❌ Error updating users:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✅ Database connection closed");
  }
}

updateUsersForAPI();
