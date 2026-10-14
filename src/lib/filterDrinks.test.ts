import { describe, expect, it } from "vitest";
import { filterDrinks } from "./filterDrinks";
import { Drink } from "@/types/drink";

const testDrinks: Drink[] = [
  { _id: "1", name: "Mocha", category: "Coffee" },
  { _id: "2", name: "Matcha", category: "Tea" },
  { _id: "3", name: "Soda", category: "Soda" },
] as Drink[];

describe("filterDrinks", () => {
  it("searches drinks by name", () => {
    const result = filterDrinks(testDrinks, "mocha", "All");
    expect(result).toEqual([testDrinks[0]]);
  });

  it("searches drinks by category", () => {
    const result = filterDrinks(testDrinks, "", "Tea");
    expect(result).toEqual([testDrinks[1]]);
  });

  it("returns an empty list when no drinks match the search query", () => {
    const result = filterDrinks(testDrinks, "potion of immortality", "All");
    expect(result).toEqual([]);
  });
});
