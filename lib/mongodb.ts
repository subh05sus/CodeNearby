import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
};

type DummyClient = { db: () => never };

const createDummyClient = (reason: string): DummyClient => ({
  db: () => {
    throw new Error(
      `MongoDB client is not available: ${reason}. Set MONGODB_URI to a valid MongoDB connection string.`
    );
  },
});

let client: MongoClient | DummyClient;
let clientPromise: Promise<MongoClient | DummyClient>;

if (!uri) {
  // Don't throw during import; return a dummy client that will raise when used.
  // This prevents the dev server from crashing when env vars are not configured.
  // Consumers should handle errors when calling `db()`.
  // eslint-disable-next-line no-console
  console.warn(
    'MONGODB_URI is not set. MongoDB client will be a dummy that throws on use.'
  );
  client = createDummyClient("MONGODB_URI not set");
  clientPromise = Promise.resolve(client as DummyClient);
} else {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient | DummyClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const mongoClient = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = mongoClient
        .connect()
        .catch((err) => {
          // Log and return a dummy client instead of rejecting to avoid unhandledRejection
          // eslint-disable-next-line no-console
          console.warn("Failed to connect to MongoDB:", err);
          return createDummyClient("connection failed");
        });
    }
    clientPromise = globalWithMongo._mongoClientPromise as Promise<
      MongoClient | DummyClient
    >;
  } else {
    const mongoClient = new MongoClient(uri, options);
    clientPromise = mongoClient.connect().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Failed to connect to MongoDB:", err);
      return createDummyClient("connection failed");
    });
  }
}

export default clientPromise;
