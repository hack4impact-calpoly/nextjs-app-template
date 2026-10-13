import { randomUUID } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import mongoose from "mongoose";

/** Enforce deadlines on lifecycle operations, including cleanup. */
export async function bounded<T>(operation: Promise<T>, stage: string, timeoutMs = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${stage} deadline exceeded.`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** No URI argument exists: every destructive operation targets a process owned here. */
export async function verifyDisposableDatabase() {
  const name = `coffee_acceptance_${randomUUID().replaceAll("-", "")}`;
  const server = new MongoMemoryServer({
    binary: { version: "7.0.24" },
    instance: { dbName: name, ip: "127.0.0.1", launchTimeout: 20000 },
  });
  const connection = mongoose.createConnection();
  const stages: string[] = [];
  try {
    await bounded(server.start(), "database start", 60000);
    await bounded(
      connection.openUri(server.getUri(name), {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      }),
      "database connect",
    );
    stages.push("owned disposable database started");
    const collection = connection.collection("lifecycle");
    const marker = randomUUID();
    const unrelated = randomUUID();
    await bounded(
      collection.insertMany([
        { marker, value: "acceptance lifecycle" },
        { marker: unrelated, value: "preserve" },
      ]),
      "write",
    );
    const saved = await bounded(collection.findOne({ marker }), "read");
    if (saved?.value !== "acceptance lifecycle") throw new Error("Read-back differs.");
    stages.push("write and read-back");
    const deleted = await bounded(collection.deleteOne({ marker }), "cleanup");
    if (deleted.deletedCount !== 1 || (await bounded(collection.countDocuments({ marker }), "cleanup read")) !== 0)
      throw new Error("Cleanup did not persist.");
    if ((await bounded(collection.countDocuments({ marker: unrelated }), "preservation read")) !== 1)
      throw new Error("Cleanup removed unrelated data.");
    stages.push("targeted cleanup and unrelated-record preservation");
  } finally {
    // Always attempt both resources even if one teardown fails.
    const outcomes = await Promise.allSettled([
      bounded(connection.close(), "connection teardown"),
      bounded(server.stop({ doCleanup: true, force: true }), "server teardown"),
    ]);
    if (
      outcomes.some((outcome) => outcome.status === "rejected") ||
      (outcomes[1].status === "fulfilled" && outcomes[1].value !== true)
    )
      throw new Error("Disposable database teardown failed.");
  }
  return [...stages, "connection closed and owned server stopped"];
}
