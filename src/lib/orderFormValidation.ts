import type { Drink, DrinkSizeOption } from "@/types/drink";

type FormValidationResult = { valid: true; sizeOption: DrinkSizeOption } | { valid: false; error: string };

export function validateOrderForm(drink: Drink, selectedSize: string, selectedMilk: string): FormValidationResult {
  const sizeOption = drink.sizes.find((option) => option.size === selectedSize);

  if (!sizeOption) {
    return {
      valid: false,
      error: "Please choose a valid size!",
    };
  }

  const hasMilkOptions = drink.milkOptions.length > 0;

  if (hasMilkOptions && !drink.milkOptions.includes(selectedMilk)) {
    return {
      valid: false,
      error: "Please choose a valid milk option!",
    };
  }

  return { valid: true, sizeOption };
}
