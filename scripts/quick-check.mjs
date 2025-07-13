import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function quickCheck() {
  try {
    await client.connect();
    const db = client.db("test");

    const userCount = await db.collection("users").countDocuments();
    const apiKeyCount = await db.collection("apiKeys").countDocuments();

    console.log(`Users: ${userCount}, API Keys: ${apiKeyCount}`);

    // Get one sample user
    const sampleUser = await db.collection("users").findOne({});
    console.log("Sample user structure:", JSON.stringify(sampleUser, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

quickCheck();
