import { describe, expect, it } from "vitest";
import { validateOrderOptions } from "@/lib/orderValidation";
import mockDrinks from "@/data/mockDrinks";

const coldBrew = mockDrinks[4];
const americano = mockDrinks[3];

describe("validateOrderOptions", () => {
  it("accepts an offered size and milk and returns the size's price", () => {
    expect(validateOrderOptions(coldBrew, "Medium", "Oat")).toEqual({
      valid: true,
      sizeOption: { size: "Medium", price: 4 },
    });
  });

  it("rejects a size the drink does not offer", () => {
    expect(validateOrderOptions(coldBrew, "Small", "Oat")).toEqual({
      valid: false,
      error: 'Size "Small" is not offered for Cold Brew. Choose from: Medium, Large',
    });
  });

  it("rejects a milk the drink does not offer", () => {
    expect(validateOrderOptions(coldBrew, "Medium", "Soy")).toEqual({
      valid: false,
      error: "Choose a milk offered for Cold Brew: Whole, Oat, Almond",
    });
  });

  it("requires milk when the drink offers milk options", () => {
    expect(validateOrderOptions(coldBrew, "Medium")).toEqual({
      valid: false,
      error: "Choose a milk offered for Cold Brew: Whole, Oat, Almond",
    });
  });

  it("accepts an order without milk for a drink with no milk options", () => {
    expect(validateOrderOptions(americano, "Small")).toEqual({
      valid: true,
      sizeOption: { size: "Small", price: 3.5 },
    });
  });

  it.each(["Oat", ""])("rejects provided milk (%j) for a drink with no milk options", (milk) => {
    expect(validateOrderOptions(americano, "Small", milk)).toEqual({
      valid: false,
      error: "Americano does not offer milk; omit milk from the order",
    });
  });

  it("reports an invalid size before an invalid milk", () => {
    expect(validateOrderOptions(coldBrew, "Small", "Soy")).toEqual({
      valid: false,
      error: 'Size "Small" is not offered for Cold Brew. Choose from: Medium, Large',
    });
  });
});
