import { MongoClient } from "mongodb";
import { mockOpportunities } from "../src/data/mockOpportunities";

// tsx doesn't load .env.local like Next does, so read it manually
process.loadEnvFile?.(".env.local");

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db("volunteerfinder").collection("opportunities");

    const { deletedCount } = await collection.deleteMany({});
    const { insertedCount } = await collection.insertMany(mockOpportunities.map((o) => ({ ...o })));

    console.log(`Cleared ${deletedCount} old documents, inserted ${insertedCount} opportunities.`);
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
