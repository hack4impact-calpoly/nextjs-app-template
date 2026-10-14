import type { Drink, DrinkSizeOption } from "@/types/drink";

type OrderValidationResult = { valid: true; sizeOption: DrinkSizeOption } | { valid: false; error: string };

export function validateOrderOptions(drink: Drink, size: string, milk?: string): OrderValidationResult {
  const sizeOption = drink.sizes.find((option) => option.size === size);
  if (!sizeOption) {
    return {
      valid: false,
      error: `Size "${size}" is not offered for ${drink.name}. Choose from: ${drink.sizes.map((option) => option.size).join(", ")}`,
    };
  }

  if (drink.milkOptions.length > 0 && (typeof milk !== "string" || !drink.milkOptions.includes(milk))) {
    return {
      valid: false,
      error: `Choose a milk offered for ${drink.name}: ${drink.milkOptions.join(", ")}`,
    };
  }
  if (drink.milkOptions.length === 0 && milk !== undefined) {
    return {
      valid: false,
      error: `${drink.name} does not offer milk; omit milk from the order`,
    };
  }

  return { valid: true, sizeOption };
}
