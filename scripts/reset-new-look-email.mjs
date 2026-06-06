/**
 * Reset newLookEmailSentAt for users beyond the first N (default 100).
 *
 * Usage:
 *   node --env-file=.env scripts/reset-new-look-email.mjs           # dry-run, skip first 100
 *   node --env-file=.env scripts/reset-new-look-email.mjs --reset   # actually reset
 *   node --env-file=.env scripts/reset-new-look-email.mjs --reset --skip=100
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DRY_RUN = !process.argv.includes("--reset");
const skipArg = process.argv.find((a) => a.startsWith("--skip="));
const SKIP = skipArg ? parseInt(skipArg.split("=")[1], 10) : 100;

if (!MONGODB_URI) { console.error("ERROR: MONGODB_URI not set"); process.exit(1); }

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db();

// Get IDs of first SKIP users — these are protected
const keep = await db
  .collection("users")
  .find({ email: { $exists: true, $ne: null, $ne: "" } })
  .project({ _id: 1 })
  .limit(SKIP)
  .toArray();

const keepIds = keep.map((u) => u._id);

// Count how many would be reset
const count = await db.collection("users").countDocuments({
  _id: { $nin: keepIds },
  newLookEmailSentAt: { $exists: true },
});

console.log(`\nFirst ${SKIP} users protected. ${count} users would have newLookEmailSentAt unset.\n`);

if (DRY_RUN) {
  console.log("Dry run. Pass --reset to actually unset.");
} else {
  const result = await db.collection("users").updateMany(
    { _id: { $nin: keepIds }, newLookEmailSentAt: { $exists: true } },
    { $unset: { newLookEmailSentAt: "" } }
  );
  console.log(`Reset ${result.modifiedCount} users.`);
}

await client.close();
