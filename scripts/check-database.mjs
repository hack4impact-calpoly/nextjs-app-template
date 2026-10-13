import nextEnv from "@next/env";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const collectionName = "_coffee_shop_verification";
const timeoutMS = 5000;
let stage = "configuration";
let client;
let collection;
let marker;
let attemptedWrite = false;
let acknowledgedWrite = false;

function pass(message) {
  console.log(`PASS ${stage}: ${message}`);
}

function fail(message) {
  console.error(`FAIL ${stage}: ${message}`);
  process.exitCode = 1;
}

// Last-resort deadline also covers DNS resolution and connection teardown.
const deadline = setTimeout(() => {
  fail("30-second deadline exceeded; verification incomplete.");
  process.exit(1);
}, 30000);

try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--write")) {
    throw new Error("configuration");
  }
  // Match `next dev` precedence. Suppress raw env-loader diagnostics.
  nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
  const uri = process.env.MONGO_URI;
  if (!uri || /[{}<>]|placeholder|mongo-uri-here|YOUR_|CHANGE_ME/i.test(uri)) {
    throw new Error("configuration");
  }
  const match = /^mongodb(?:\+srv)?:\/\/[^/]+\/([A-Za-z0-9_-]+)(?:\?.*)?$/.exec(uri);
  if (!match || ["admin", "local", "config"].includes(match[1])) {
    throw new Error("configuration");
  }
  const databaseName = match[1];
  client = new mongoose.mongo.MongoClient(uri, {
    serverSelectionTimeoutMS: timeoutMS,
    connectTimeoutMS: timeoutMS,
    socketTimeoutMS: timeoutMS,
    waitQueueTimeoutMS: timeoutMS,
    retryReads: false,
    retryWrites: false,
    readPreference: "primary",
    writeConcern: { w: 1, wtimeoutMS: timeoutMS },
  });
  pass(`database=${databaseName}; mode=${args.length ? "write" : "read-only"}`);
  stage = "connect";
  await client.connect();
  pass("Connected.");
  collection = client.db(databaseName).collection(collectionName);
  stage = "read";
  // A real find checks read permission even when the collection is empty.
  await collection.findOne({}, { maxTimeMS: timeoutMS, projection: { _id: 1 } });
  pass(`Read ${collectionName}; no document contents printed.`);
  if (args.length) {
    marker = randomUUID();
    stage = "write";
    console.log(`INFO disposable marker=${marker}; collection=${collectionName}`);
    attemptedWrite = true;
    const result = await collection.insertOne({
      _id: marker,
      purpose: "coffee-shop-access-check",
    });
    if (!result.acknowledged) throw new Error("write");
    acknowledgedWrite = true;
    pass("Disposable write acknowledged.");
    stage = "read-back";
    const record = await collection.findOne({ _id: marker }, { maxTimeMS: timeoutMS });
    if (record?.purpose !== "coffee-shop-access-check") throw new Error("read-back");
    pass("Disposable marker read back.");
  }
} catch {
  fail(
    stage === "configuration"
      ? "Use no arguments or --write. Set a non-placeholder MONGO_URI in private .env.local with an explicit database name (letters, digits, underscores, hyphens; excluding admin/local/config)."
      : "Database operation failed; check permissions, credentials, network access, and cluster availability.",
  );
} finally {
  if (attemptedWrite) {
    stage = "cleanup";
    try {
      // Attempt cleanup even if insert acknowledgement was lost. Never clear data.
      const result = await collection.deleteOne({ _id: marker });
      if (!result.acknowledged || (acknowledgedWrite && result.deletedCount !== 1)) {
        throw new Error("cleanup");
      }
      pass("Only this run's marker removed (or absent after a failed write).");
    } catch {
      fail(`Cleanup unverified. Ask Brian to inspect marker=${marker} in ${collectionName}.`);
    }
  }
  if (client) {
    stage = "close";
    try {
      await client.close();
      pass("Connection closed.");
    } catch {
      fail("Connection teardown failed.");
    }
  }
  clearTimeout(deadline);
}
