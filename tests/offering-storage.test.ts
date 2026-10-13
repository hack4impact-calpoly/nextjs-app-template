import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { offeringStore } from "@/database/offeringStore";
import type { CreateOfferingInput } from "@/types/offering";

test("offering storage persists public offerings in disposable local MongoDB", async (t) => {
  const server = await MongoMemoryServer.create({ binary: { version: "7.0.24" } });
  process.env.MONGO_URI = server.getUri("coffee_storage_test");
  try {
    await t.test("empty collection returns an empty list", async () => {
      assert.deepEqual(await offeringStore.list(), []);
    });

    await t.test(
      "create persists trimmed details and returns only public fields with generated string identity",
      async () => {
        const saved = await offeringStore.create({
          name: "  Vanilla Latte  ",
          description: "  Espresso with vanilla and milk  ",
          price: 5.75,
          category: "Coffee",
        });
        assert.match(saved.ID, /^[a-f0-9]{24}$/);
        assert.deepEqual(saved, {
          ID: saved.ID,
          name: "Vanilla Latte",
          description: "Espresso with vanilla and milk",
          price: 5.75,
          category: "Coffee",
          specialOffer: false,
        });
        assert.deepEqual(await offeringStore.list(), [saved]);
      },
    );

    await t.test("list sorts by name then generated string ID, including duplicate names", async () => {
      const zulu = await offeringStore.create({ name: "Zulu", description: "Last", price: 0, category: "Tea" });
      const alpha = await offeringStore.create({ name: "Alpha", description: "First", price: 1, category: "Tea" });
      // Arrange equal-name documents in reverse ID order to exercise the tie-breaker.
      await mongoose.connection.collection("offerings").insertMany([
        { ...alpha, ID: undefined, _id: new mongoose.Types.ObjectId("000000000000000000000002"), name: "Aardvark" },
        { ...alpha, ID: undefined, _id: new mongoose.Types.ObjectId("000000000000000000000001"), name: "Aardvark" },
      ]);
      const list = await offeringStore.list();
      assert.deepEqual(
        list.map((offering) => offering.name),
        ["Aardvark", "Aardvark", "Alpha", "Vanilla Latte", "Zulu"],
      );
      assert.deepEqual(
        list.slice(0, 2).map((offering) => offering.ID),
        ["000000000000000000000001", "000000000000000000000002"],
      );
      assert.equal(list.at(-1)?.ID, zulu.ID);
    });

    await t.test("model guards reject invalid details without persisting them", async () => {
      const valid: CreateOfferingInput = { name: "Guard", description: "Valid", price: 1, category: "Tea" };
      const before = await offeringStore.list();
      for (const changes of [
        { name: "   " },
        { name: "n".repeat(101) },
        { description: "   " },
        { description: "d".repeat(501) },
        { category: "Other" },
        { price: -1 },
        { price: Number.NaN },
        { price: Number.POSITIVE_INFINITY },
        { price: 1.001 },
        { specialOffer: null },
        { specialOffer: "maybe" },
      ]) {
        await assert.rejects(offeringStore.create({ ...valid, ...changes } as CreateOfferingInput));
      }
      assert.deepEqual(await offeringStore.list(), before);
    });

    await t.test(
      "zero price, boundary text lengths, floating-point cents, and explicit special flags are supported",
      async () => {
        const zero = await offeringStore.create({
          name: "n".repeat(100),
          description: "d".repeat(500),
          price: 0,
          category: "Smoothie",
          specialOffer: true,
        });
        const decimal = await offeringStore.create({
          name: "Decimal",
          description: "Floating-point cents",
          price: 0.1 + 0.2,
          category: "Tea",
          specialOffer: false,
        });
        assert.equal(zero.price, 0);
        assert.equal(zero.specialOffer, true);
        assert.equal(decimal.specialOffer, false);
        assert.equal(decimal.price, 0.1 + 0.2);
        assert.ok((await offeringStore.list()).some((offering) => offering.ID === zero.ID));
      },
    );

    await t.test(
      "seed inserts 16 starting offerings and reruns preserve IDs, edits, and unrelated records",
      async () => {
        const { seedOfferings } = await import("@/database/seedOffering");
        const unrelated = await offeringStore.list();
        assert.equal(await seedOfferings(), 16);
        const seeded = (await offeringStore.list()).filter(
          (offering) => !unrelated.some((item) => item.ID === offering.ID),
        );
        assert.equal(seeded.length, 16);
        assert.deepEqual(
          seeded.filter((offering) => offering.specialOffer).map((offering) => offering.name),
          ["Golden Hour Cold Brew", "Hojicha Latte", "Pumpkin Spice Latte"],
        );
        assert.deepEqual(
          seeded.map((offering) => offering.name),
          [
            "Cafe au Lait",
            "Cappuccino",
            "Chai Latte",
            "Chamomile Tea",
            "Cortado",
            "English Breakfast Tea",
            "Espresso",
            "Fruit Smoothie",
            "Golden Hour Cold Brew",
            "Hojicha Latte",
            "Iced Hibiscus Berry",
            "Latte",
            "London Fog",
            "Matcha",
            "Mocha",
            "Pumpkin Spice Latte",
          ],
        );
        for (const offering of seeded) {
          assert.match(offering.ID, /^[a-f0-9]{24}$/);
          assert.deepEqual(Object.keys(offering).sort(), [
            "ID",
            "category",
            "description",
            "name",
            "price",
            "specialOffer",
          ]);
        }

        const cappuccino = seeded.find((offering) => offering.name === "Cappuccino")!;
        // Simulate an operator edit, including rename. Identity must not depend on the name.
        await mongoose.connection
          .collection("offerings")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(cappuccino.ID) },
            { $set: { name: "Operator's Cappuccino", description: "Keep my edit", price: 7.25, specialOffer: true } },
          );
        const beforeRerun = await offeringStore.list();
        assert.equal(await seedOfferings(), 0);
        assert.deepEqual(await offeringStore.list(), beforeRerun);
        assert.equal(await seedOfferings(), 0);
        assert.deepEqual(await offeringStore.list(), beforeRerun);
        for (const offering of unrelated) {
          assert.deepEqual(
            (await offeringStore.list()).find((item) => item.ID === offering.ID),
            offering,
          );
        }
      },
    );
  } finally {
    await mongoose.disconnect();
    await server.stop();
    delete process.env.MONGO_URI;
  }
});
