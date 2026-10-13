import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { CATEGORIES } from "../lib/validateMenuItem";

dotenv.config({ path: ".env.local" });

beforeAll(async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing from .env.local");
  }

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

function getItemsCollection() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection was not established");
  }

  return db.collection("items");
}

describe("MongoDB menu items", () => {
  it("every item has all required fields", async () => {
    const items = await getItemsCollection().find({}).toArray();

    expect(items.length).toBeGreaterThan(0);

    items.forEach((item) => {
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();

      expect(typeof item.price).toBe("number");
      expect(item.price).toBeGreaterThan(0);

      expect(item.category).toBeTruthy();

      expect(typeof item.available).toBe("boolean");

      if (item.imageUrl !== undefined) {
        expect(typeof item.imageUrl).toBe("string");
      }
    });
  });

  it("every item has a valid category", async () => {
    const items = await getItemsCollection().find({}).toArray();

    items.forEach((item) => {
      expect(CATEGORIES).toContain(item.category);
    });
  });

  it("all item names are unique", async () => {
    const items = await getItemsCollection().find({}).toArray();

    const names = items.map((item) => item.name);
    const uniqueNames = new Set(names);

    expect(uniqueNames.size).toBe(names.length);
  });

  it("every category has at least 3 items", async () => {
    const items = await getItemsCollection().find({}).toArray();

    CATEGORIES.forEach((category) => {
      const itemsInCategory = items.filter((item) => item.category === category);

      expect(itemsInCategory.length).toBeGreaterThanOrEqual(3);
    });
  });
});
