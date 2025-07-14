// updateUsers.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI; // Change if needed
const dbName = "test";
const collectionName = "users";

const fieldsToRemove = {
  apiUsage: "",
  createdAt: "",
  dailyTokens: "",
  dailyTokensResetAt: "",
  lastActiveAt: "",
  purchasedTokens: "",
  tier: "",
  totalTokensUsed: "",
  apiKeys: "",
};

async function cleanUsers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const users = db.collection(collectionName);

    const updateResult = await users.updateMany({}, { $unset: fieldsToRemove });

    console.log(`Updated ${updateResult.modifiedCount} user(s).`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

cleanUsers();
