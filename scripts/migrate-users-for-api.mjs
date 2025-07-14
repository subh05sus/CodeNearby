import { MongoClient } from "mongodb";
import { config } from "dotenv";

config({ path: ".env" });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "test";

async function migrateUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection("users");

    // Get current date for token reset tracking
    const now = new Date();

    // Update all existing users with new API-related fields
    const result = await usersCollection.updateMany(
      {}, // Update all users
      {
        $set: {
          // User tier - all existing users start as free
          tier: "free",

          // Token balance system
          tokenBalance: {
            daily: 1000, // Free tier gets 1000 daily tokens
            purchased: 0, // No purchased tokens initially
            total: 1000, // Total available tokens
          },

          // Usage tracking
          usage: {
            today: {
              tokens: 0,
              requests: 0,
              date: now.toISOString().split("T")[0], // YYYY-MM-DD format
            },
            total: {
              tokens: 0,
              requests: 0,
            },
          },

          // API key tracking
          apiKeyCount: 0,
          maxApiKeys: 1, // Free tier limit

          // Billing information
          billing: {
            currency: "USD",
            totalSpent: 0,
            purchases: [],
          },

          // Token reset tracking
          lastTokenReset: now,

          // Feature access based on tier
          features: {
            developerSearch: true,
            profileAnalysis: true,
            repositorySearch: false, // Premium feature
            analytics: false, // Premium feature
            prioritySupport: false, // Premium feature
          },

          // Account verification status
          verification: {
            email: false,
            phone: false,
            github: true, // Since they already have GitHub OAuth
          },
        },
      }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} users`);

    // Create indexes for better performance
    await usersCollection.createIndex({ tier: 1 });
    await usersCollection.createIndex({ "tokenBalance.total": 1 });
    await usersCollection.createIndex({ "usage.today.date": 1 });
    await usersCollection.createIndex({ githubUsername: 1 });
    await usersCollection.createIndex({ email: 1 });

    console.log("✅ Created database indexes");

    // Create apiKeys collection if it doesn't exist
    const apiKeysCollection = db.collection("apiKeys");
    await apiKeysCollection.createIndex({ userId: 1 });
    await apiKeysCollection.createIndex({ keyHash: 1 }, { unique: true });
    await apiKeysCollection.createIndex({ isActive: 1 });
    await apiKeysCollection.createIndex({ createdAt: 1 });

    console.log("✅ Prepared apiKeys collection with indexes");

    // Print sample updated user
    const sampleUser = await usersCollection.findOne({});
    console.log("\n📄 Sample updated user structure:");
    console.log(
      JSON.stringify(
        {
          _id: sampleUser._id,
          name: sampleUser.name,
          email: sampleUser.email,
          tier: sampleUser.tier,
          tokenBalance: sampleUser.tokenBalance,
          usage: sampleUser.usage,
          features: sampleUser.features,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
    console.log("\n🔐 Database connection closed");
  }
}

// Run the migration
migrateUsers()
  .then(() => {
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });

export default { migrateUsers };
