import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import mongoose from "mongoose";

test("insert-only seeding preserves offering edits, IDs, and unrelated records", { timeout: 60000 }, async (t) => {
  const database = await MongoMemoryServer.create({ binary: { version: "7.0.24" } });
  const uri = database.getUri("coffee_seed_test");
  process.env.MONGO_URI = uri;
  const { offeringStore } = await import("../src/database/offeringStore.ts");
  async function seed(args = ["--apply"]) {
    const child = spawn(process.execPath, ["--import", "tsx", "scripts/seed-offerings.ts", ...args], {
      env: { ...process.env, MONGO_URI: uri },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (data) => {
        output += data.toString();
      });
    const [code] = await once(child, "close");
    return { code, output };
  }
  try {
    await t.test("first seed inserts 16 public offerings with exactly three specials", async () => {
      assert.equal((await seed()).code, 0);
      const offerings = await offeringStore.list();
      assert.equal(offerings.length, 16);
      assert.equal(offerings.filter((offering) => offering.specialOffer).length, 3);
      for (const offering of offerings) {
        assert.match(offering.ID, /^[a-f\d]{24}$/);
        assert.deepEqual(Object.keys(offering).sort(), [
          "ID",
          "category",
          "description",
          "name",
          "price",
          "specialOffer",
        ]);
      }
    });
    await t.test("rerun preserves edited seeded records and unrelated creations", async () => {
      const cappuccino = (await offeringStore.list()).find((offering) => offering.name === "Cappuccino");
      const { ID, ...details } = cappuccino;
      await offeringStore.update(ID, { ...details, price: 8.25 });
      const unrelated = await offeringStore.create({
        name: "Team creation",
        description: "Keep this offering",
        price: 3,
        category: "Tea",
      });
      assert.equal((await seed()).code, 0);
      const offerings = await offeringStore.list();
      assert.equal(offerings.length, 17);
      assert.equal(offerings.find((offering) => offering.ID === ID).price, 8.25);
      assert.deepEqual(
        offerings.find((offering) => offering.ID === unrelated.ID),
        { ...unrelated, specialOffer: false },
      );
    });
    await t.test("seed refuses execution without explicit confirmation", async () => {
      const before = await offeringStore.list();
      const result = await seed([]);
      assert.equal(result.code, 1);
      assert.doesNotMatch(result.output, /mongodb:\/\//);
      assert.deepEqual(await offeringStore.list(), before);
    });
  } finally {
    await mongoose.disconnect();
    await database.stop();
  }
});
