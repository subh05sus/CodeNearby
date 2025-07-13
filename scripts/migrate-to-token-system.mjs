import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

const client = new MongoClient(uri);

async function migrateToTokenSystem() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;

    for (const user of users) {
      try {
        // Initialize token-based structure
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
            amountSpent: {
              usd: 0,
              inr: 0,
            },
            month: new Date().toISOString().slice(0, 7),
          },
          lifetime: {
            tokensUsed: 0,
            tokensPurchased: 0,
            requests: 0,
            amountSpent: {
              usd: 0,
              inr: 0,
            },
            apiKeysCreated: 0,
          },
        };

        const limits = {
          maxApiKeys: 1,
          dailyFreeTokens: 1000,
          features: ["developer-search"],
        };

        const billing = {
          paymentMethods: [],
          defaultPaymentMethod: null,
          lastPurchase: null,
        };

        const preferences = {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          lowTokenAlerts: true,
          marketingEmails: user.preferences?.marketingEmails ?? false,
          currency: user.preferences?.currency ?? "USD",
          tokenAlertThreshold: 100,
        };

        // Determine tier based on existing data
        let tier = "free";
        if (user.tier) {
          switch (user.tier) {
            case "starter":
            case "developer":
              tier = "verified";
              tokenBalance.daily = 1000;
              tokenBalance.total = 1000;
              limits.dailyFreeTokens = 1000;
              limits.maxApiKeys = 3;
              break;
            case "business":
            case "enterprise":
              tier = "premium";
              tokenBalance.daily = 2000;
              tokenBalance.total = 2000;
              limits.dailyFreeTokens = 2000;
              limits.maxApiKeys = 10;
              break;
          }
        }

        // Preserve some existing usage data if available
        if (user.usage?.lifetime) {
          usage.lifetime.requests = user.usage.lifetime.requests || 0;
          usage.lifetime.apiKeysCreated =
            user.usage.lifetime.apiKeysCreated || 0;
        }

        const updateDoc = {
          $set: {
            tier,
            tierStatus: "active",
            tokenBalance,
            usage,
            limits,
            billing,
            preferences,
            updatedAt: new Date(),
          },
        };

        // Remove old fields if they exist
        const unsetFields = {};
        if (user.tierEndDate !== undefined) unsetFields.tierEndDate = "";
        if (Object.keys(unsetFields).length > 0) {
          updateDoc.$unset = unsetFields;
        }

        await usersCollection.updateOne({ _id: user._id }, updateDoc);

        migratedCount++;
        console.log(
          `✓ Migrated user ${user.email || user._id} (${migratedCount}/${
            users.length
          })`
        );
      } catch (error) {
        console.error(
          `✗ Failed to migrate user ${user.email || user._id}:`,
          error
        );
      }
    }

    console.log(`\nMigration completed!`);
    console.log(
      `Successfully migrated ${migratedCount}/${users.length} users to token-based system`
    );

    // Update API keys to use new tier system
    console.log("\nMigrating API keys...");
    const apiKeysCollection = db.collection("apiKeys");
    const apiKeys = await apiKeysCollection.find({}).toArray();

    let apiKeysMigrated = 0;
    for (const apiKey of apiKeys) {
      try {
        let newTier = "free";
        switch (apiKey.tier) {
          case "starter":
          case "developer":
            newTier = "verified";
            break;
          case "business":
          case "enterprise":
            newTier = "premium";
            break;
        }

        await apiKeysCollection.updateOne(
          { _id: apiKey._id },
          {
            $set: {
              tier: newTier,
            },
            $unset: {
              rateLimit: "",
              tokenLimit: "",
              dailyUsage: "",
              requestCount: "",
            },
          }
        );

        apiKeysMigrated++;
      } catch (error) {
        console.error(`Failed to migrate API key ${apiKey._id}:`, error);
      }
    }

    console.log(`✓ Migrated ${apiKeysMigrated}/${apiKeys.length} API keys`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the migration
migrateToTokenSystem()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
