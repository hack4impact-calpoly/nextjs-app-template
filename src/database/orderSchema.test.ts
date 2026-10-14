import { describe, expect, it } from "vitest";
import Order from "@/database/orderSchema";

const validOrder = {
  drinkId: "507f1f77bcf86cd799439011",
  drinkName: "Cold Brew",
  customerName: "Sam",
  size: "Medium",
  milk: "Oat",
  price: 4,
};

// validateSync runs the schema validators in memory, no database connection needed
function validate(overrides: Record<string, unknown>) {
  return new Order({ ...validOrder, ...overrides }).validateSync();
}

describe("Order schema", () => {
  it("accepts a valid order", () => {
    expect(validate({})).toBeUndefined();
  });

  it("accepts an order without milk", () => {
    expect(validate({ milk: undefined })).toBeUndefined();
  });

  it.each([
    { field: "drinkId", overrides: { drinkId: "abc" }, path: "drinkId" },
    { field: "missing drinkName", overrides: { drinkName: undefined }, path: "drinkName" },
    { field: "missing customerName", overrides: { customerName: undefined }, path: "customerName" },
    { field: "blank customerName", overrides: { customerName: "   " }, path: "customerName" },
    { field: "long customerName", overrides: { customerName: "a".repeat(51) }, path: "customerName" },
    { field: "size", overrides: { size: "Venti" }, path: "size" },
    { field: "price", overrides: { price: -1 }, path: "price" },
    { field: "missing price", overrides: { price: undefined }, path: "price" },
  ])("rejects a bad $field", ({ overrides, path }) => {
    const error = validate(overrides);
    expect(error?.errors[path]).toBeDefined();
  });

  it("trims the drink name, customer name and milk", () => {
    const order = new Order({ ...validOrder, drinkName: "  Cold Brew ", customerName: " Sam ", milk: " Oat " });
    expect(order.drinkName).toBe("Cold Brew");
    expect(order.customerName).toBe("Sam");
    expect(order.milk).toBe("Oat");
  });
});
