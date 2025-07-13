import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function checkDataLocation() {
  try {
    await client.connect();

    const databases = ["codenearby", "test"];

    for (const dbName of databases) {
      console.log(`\n=== Database: ${dbName} ===`);
      const db = client.db(dbName);

      const userCount = await db.collection("users").countDocuments();
      const apiKeyCount = await db.collection("apiKeys").countDocuments();

      console.log(`Users: ${userCount}`);
      console.log(`API Keys: ${apiKeyCount}`);

      if (userCount > 0) {
        const sampleUser = await db.collection("users").findOne({});
        console.log(
          `Sample user has tokenBalance: ${!!sampleUser?.tokenBalance}`
        );
        console.log(`Sample user tier: ${sampleUser?.tier}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkDataLocation();
