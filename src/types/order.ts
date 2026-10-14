import { DrinkSize } from "@/types/drink";

export interface Order {
  _id: string;
  drinkId: string;
  drinkName: string;
  customerName?: string; // missing on orders placed before names were added
  size: DrinkSize;
  milk?: string; // left out if the drink has no milk
  price: number; // price of the chosen size, in dollars
  createdAt: string; // ISO date string, set by the database
}

// what the frontend sends when placing an order
export type NewOrder = Pick<Order, "drinkId" | "size" | "milk"> & { customerName: string };
