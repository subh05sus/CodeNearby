import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function updateTokensTo1000() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("test");

    // Update all users to have 1000 daily tokens instead of 500
    const updateResult = await db.collection("users").updateMany(
      {
        "limits.dailyFreeTokens": 500,
      },
      {
        $set: {
          "limits.dailyFreeTokens": 1000,
          "tokenBalance.daily": 1000,
          "tokenBalance.total": 1000,
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `✅ Updated ${updateResult.modifiedCount} users to have 1000 daily tokens`
    );

    // Also update any users who might have 0 tokens
    const zeroTokenUpdate = await db.collection("users").updateMany(
      {
        $or: [{ "tokenBalance.total": 0 }, { "tokenBalance.daily": 0 }],
      },
      {
        $set: {
          "limits.dailyFreeTokens": 1000,
          "tokenBalance.daily": 1000,
          "tokenBalance.total": 1000,
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `✅ Updated ${zeroTokenUpdate.modifiedCount} users who had 0 tokens`
    );

    // Reset daily tokens for all users to ensure they get the new amount
    const resetResult = await db.collection("users").updateMany(
      {},
      {
        $set: {
          "tokenBalance.lastDailyReset": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✅ Reset daily tokens for ${resetResult.modifiedCount} users`);
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

updateTokensTo1000();
