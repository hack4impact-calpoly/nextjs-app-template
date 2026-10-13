import { beforeEach, expect, test, vi } from "vitest";

const { connectDBMock, findMock } = vi.hoisted(() => ({
  connectDBMock: vi.fn(),
  findMock: vi.fn(),
}));

vi.mock("@/database/db", () => ({ default: connectDBMock }));
vi.mock("@/database/offeringModel", () => ({ default: { find: findMock } }));

import { offeringStore } from "@/database/offeringStore";

function storedOffering(ID: string, name: string) {
  return {
    _id: { toString: () => ID },
    name,
    description: "Espresso with steamed milk",
    category: "Coffee",
    price: 6.99,
    specialOffer: false,
    seedKey: `seed-${ID}`,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  connectDBMock.mockResolvedValue(undefined);
  findMock.mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
});

// Internal database fields must not leak into the public offering response.
test("returns only public offering fields with a string ID", async () => {
  findMock.mockReturnValue({ lean: vi.fn().mockResolvedValue([storedOffering("offer-1", "Latte")]) });

  const [offering] = await offeringStore.list();

  expect(typeof offering.ID).toBe("string");
  expect(offering).toEqual({
    ID: "offer-1",
    name: "Latte",
    description: "Espresso with steamed milk",
    price: 6.99,
    category: "Coffee",
    specialOffer: false,
  });
  expect(offering).not.toHaveProperty("seedKey");
  expect(offering).not.toHaveProperty("_id");
});

// Equal names still need deterministic ordering by their public IDs.
test("sorts offerings with identical names by ID", async () => {
  findMock.mockReturnValue({
    lean: vi.fn().mockResolvedValue([storedOffering("offer-b", "Latte"), storedOffering("offer-a", "Latte")]),
  });

  const offerings = await offeringStore.list();

  expect(offerings.map((offering) => offering.ID)).toEqual(["offer-a", "offer-b"]);
});

// A failed connection must reject rather than return sample or empty data.
test("throws an error when the database is unavailable", async () => {
  connectDBMock.mockRejectedValue(new Error("Database unavailable"));

  await expect(offeringStore.list()).rejects.toThrow("Database unavailable");
  expect(findMock).not.toHaveBeenCalled();
});
