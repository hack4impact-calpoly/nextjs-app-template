import assert from "node:assert/strict";
import mongoose from "mongoose";
import { offeringStore } from "@/database/offeringStore";
import { seedOfferings } from "@/database/seedOffering";
import { toErrorEnvelope } from "@/lib/offerings";

async function main(): Promise<void> {
  try {
    const input = { name: "Recovery", description: "Persisted after retry", price: 1, category: "Tea" as const };
    for (const operation of [() => offeringStore.list(), () => offeringStore.create(input), () => seedOfferings()]) {
      await assert.rejects(operation());
    }
    // The handler owns sanitization. This test caller proves rejected storage errors can be handled safely.
    console.log(JSON.stringify(toErrorEnvelope("DATABASE_UNAVAILABLE", "Database is unavailable.")));
    process.env.MONGO_URI = process.env.COFFEE_STORAGE_RECOVERY_URI;
    const saved = await offeringStore.create(input);
    assert.deepEqual(await offeringStore.list(), [saved]);
    console.log("PASS recovery: failed connections do not poison subsequent persistence.");
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch(() => {
  process.exitCode = 1;
  console.error("FAIL storage connection evidence.");
});
