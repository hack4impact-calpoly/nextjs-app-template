import { describe, expect, it } from "vitest";
import mockDrinks from "@/data/mockDrinks";
import { validateOrderForm } from "@/lib/orderFormValidation";

const coldBrew = mockDrinks[4];

describe("validateOrderForm", () => {
  it("rejects an order when no size is selected", () => {
    expect(validateOrderForm(coldBrew, "", "Oat")).toEqual({
      valid: false,
      error: "Please choose a valid size!",
    });
  });

  it("rejects an order missing milk when there are milk options", () => {
    expect(validateOrderForm(coldBrew, "Medium", "")).toEqual({
      valid: false,
      error: "Please choose a valid milk option!",
    });
  });

  it("accepts a valid size and milk choice", () => {
    expect(validateOrderForm(coldBrew, "Medium", "Oat")).toEqual({
      valid: true,
      sizeOption: { size: "Medium", price: 4 },
    });
  });
});
