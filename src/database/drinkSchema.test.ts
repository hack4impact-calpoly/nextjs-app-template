import { describe, expect, it } from "vitest";
import Drink from "@/database/drinkSchema";
import mockDrinks from "@/data/mockDrinks";

// mock ids like "1" aren't valid ObjectIds, so leave _id for Mongoose to generate
const { _id, ...validDrink } = mockDrinks[0];

// validateSync runs the schema validators in memory, no database connection needed
function validate(overrides: Record<string, unknown>) {
  return new Drink({ ...validDrink, ...overrides }).validateSync();
}

describe("Drink schema", () => {
  it("accepts a valid drink", () => {
    expect(validate({})).toBeUndefined();
  });

  it.each([
    { field: "category", overrides: { category: "Juice" }, path: "category" },
    { field: "missing name", overrides: { name: undefined }, path: "name" },
    { field: "missing imageUrl", overrides: { imageUrl: undefined }, path: "imageUrl" },
    { field: "size", overrides: { sizes: [{ size: "XL", price: 3 }] }, path: "sizes.0.size" },
    { field: "price", overrides: { sizes: [{ size: "Small", price: 0 }] }, path: "sizes.0.price" },
  ])("rejects a bad $field", ({ overrides, path }) => {
    const error = validate(overrides);
    expect(error?.errors[path]).toBeDefined();
  });

  it("rejects a drink with no sizes", () => {
    const error = validate({ sizes: [] });
    expect(error?.errors.sizes?.message).toBe("A drink needs at least one size");
  });

  it("trims the name and fills in defaults", () => {
    const drink = new Drink({ ...validDrink, name: "  Coffee  ", milkOptions: undefined, isBestseller: undefined });
    expect(drink.name).toBe("Coffee");
    expect(drink.milkOptions).toEqual([]);
    expect(drink.isBestseller).toBe(false);
  });
});
