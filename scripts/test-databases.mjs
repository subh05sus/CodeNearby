import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function testDatabaseNames() {
  try {
    await client.connect();

    // List all databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();

    console.log("Available databases:");
    for (const dbInfo of dbList.databases) {
      console.log(`- ${dbInfo.name}`);
    }

    // Test both potential database names
    const databases = ["codenearby", "test"];
    const apiKey = "cn_free_kt3kJxEX_DKkiSpQHIxaTCkchtDgRyYk_tL1gq_GC";
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    for (const dbName of databases) {
      console.log(`\nChecking database: ${dbName}`);
      const db = client.db(dbName);

      const collections = await db.listCollections().toArray();
      console.log(
        `Collections in ${dbName}:`,
        collections.map((c) => c.name)
      );

      if (collections.some((c) => c.name === "apiKeys")) {
        const apiKeyCount = await db.collection("apiKeys").countDocuments();
        console.log(`API keys in ${dbName}: ${apiKeyCount}`);

        const keyMatch = await db.collection("apiKeys").findOne({
          hashedKey,
          isActive: true,
        });

        if (keyMatch) {
          console.log(`✅ Found API key in ${dbName}:`, keyMatch.name);
        } else {
          console.log(`❌ API key not found in ${dbName}`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

testDatabaseNames();
