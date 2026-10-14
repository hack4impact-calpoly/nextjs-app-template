export type DrinkCategory = "Coffee" | "Tea";

export type DrinkSize = "Small" | "Medium" | "Large";

export interface DrinkSizeOption {
  size: DrinkSize;
  price: number; // in dollars
}

export interface Drink {
  _id: string;
  name: string;
  description: string;
  category: DrinkCategory;
  sizes: DrinkSizeOption[];
  milkOptions: string[]; // empty array if the drink has no milk
  imageUrl: string;
  isBestseller: boolean;
}
