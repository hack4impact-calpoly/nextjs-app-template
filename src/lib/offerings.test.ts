import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchOfferings,
  OfferingApiError,
  sortOfferings,
  submitOffering,
  validateOfferingInput,
} from "@/lib/offerings";
import { OFFERING_INPUT_LIMITS, type Offering } from "@/types/offering";

const sampleOfferings: Offering[] = [
  {
    ID: "offer-2",
    name: "Cinnamon Latte",
    description: "Warm coffee with cinnamon sweetness.",
    price: 5.5,
    category: "Coffee",
    specialOffer: false,
  },
  {
    ID: "offer-1",
    name: "Apple Tea",
    description: "A bright and refreshing tea blend.",
    price: 4.5,
    category: "Tea",
    specialOffer: true,
  },
];

test("fetchOfferings uses the server message and safely falls back for non-JSON failures", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: { code: "DATABASE_UNAVAILABLE", message: "Please try again later." } }), {
        status: 503,
      });
    await assert.rejects(fetchOfferings(), { message: "Please try again later." });
    globalThis.fetch = async () => new Response("Service unavailable", { status: 503 });
    await assert.rejects(fetchOfferings(), { message: "We could not load the current offerings." });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sortOfferings orders by name and then id", () => {
  assert.deepStrictEqual(sortOfferings(sampleOfferings), [sampleOfferings[1], sampleOfferings[0]]);
});

test("validateOfferingInput catches malformed data", () => {
  const errors = validateOfferingInput({
    name: "",
    description: "   ",
    price: "not-a-number",
    category: "Bakery",
    specialOffer: "false",
  });

  assert.equal(errors.name, "Name is required.");
  assert.equal(errors.description, "Description is required.");
  assert.equal(errors.price, "Price must be a valid number.");
  assert.equal(errors.category, "Choose a valid category.");
  assert.equal(errors.specialOffer, "Special offer must be a boolean.");
});

test("validateOfferingInput accepts at most two decimal places and trims text", () => {
  assert.deepStrictEqual(
    validateOfferingInput({
      name: "  Latte  ",
      description: "  Espresso with steamed milk.  ",
      price: 4.25,
      category: "Coffee",
    }),
    {},
  );
  assert.equal(
    validateOfferingInput({
      name: "Latte",
      description: "Espresso with steamed milk.",
      price: 4.251,
      category: "Coffee",
    }).price,
    "Price can have at most two decimal places.",
  );
});

test("validateOfferingInput enforces shared text limits and accepts zero price", () => {
  assert.deepStrictEqual(
    validateOfferingInput({
      name: "x".repeat(OFFERING_INPUT_LIMITS.name + 1),
      description: "x".repeat(OFFERING_INPUT_LIMITS.description + 1),
      price: 0,
      category: "Smoothie",
    }),
    {
      name: `Name must be ${OFFERING_INPUT_LIMITS.name} characters or fewer.`,
      description: `Description must be ${OFFERING_INPUT_LIMITS.description} characters or fewer.`,
    },
  );
});

test("submitOffering trims text and always sends the special-offer boolean", async () => {
  const originalFetch = globalThis.fetch;
  const requestBodies: unknown[] = [];
  let createdId = 0;
  globalThis.fetch = async (_input, init) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    createdId += 1;
    return new Response(
      JSON.stringify({
        ID: `created-${createdId}`,
        name: "Coffee",
        description: "A fresh cup.",
        price: 2.5,
        category: "Coffee",
        specialOffer: false,
      }),
      { status: 201 },
    );
  };

  try {
    await submitOffering({
      name: " Coffee ",
      description: " A fresh cup. ",
      price: 2.5,
      category: "Coffee",
      specialOffer: true,
    });
    await submitOffering({
      name: "Tea",
      description: "A fresh tea.",
      price: 2,
      category: "Tea",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepStrictEqual(requestBodies, [
    {
      name: "Coffee",
      description: "A fresh cup.",
      price: 2.5,
      category: "Coffee",
      specialOffer: true,
    },
    {
      name: "Tea",
      description: "A fresh tea.",
      price: 2,
      category: "Tea",
      specialOffer: false,
    },
  ]);
});

test("submitOffering exposes server field errors from the shared error envelope", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          code: "INVALID_INPUT",
          message: "Fix the highlighted fields.",
          fields: { name: "Name is already invalid." },
        },
      }),
      { status: 400 },
    );

  try {
    await assert.rejects(
      submitOffering({
        name: "Coffee",
        description: "A fresh cup.",
        price: 2.5,
        category: "Coffee",
      }),
      (error: unknown) =>
        error instanceof OfferingApiError &&
        error.message === "Fix the highlighted fields." &&
        error.fields.name === "Name is already invalid.",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
