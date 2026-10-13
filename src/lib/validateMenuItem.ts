export const CATEGORIES = ["coffee", "tea", "milktea", "pastry", "cake"] as const;
export type Category = (typeof CATEGORIES)[number];

export type MenuItemField = "name" | "description" | "price" | "category" | "available" | "imageUrl";
export type MenuItemErrors = Partial<Record<MenuItemField, string>>;

export interface MenuItemInput {
  name: string;
  description: string;
  price: number;
  category: Category;
  available: boolean;
  imageUrl?: string;
}

// validates menu item data. shared by the frontend form and the API route so both enforce the same rules.

//checks each field of the menu item input for validity
export function validateMenuItem(input: unknown): MenuItemErrors {
  const errors: MenuItemErrors = {};
  if (typeof input !== "object" || input === null) {
    return { name: "Name is required.", description: "Description is required.", price: "Price is required." };
  }
  const data = input as Record<string, unknown>;

  //checks name field for string and length
  if (typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  //checks description field for string and length
  if (typeof data.description !== "string" || !data.description.trim()) {
    errors.description = "Description is required.";
  } else if (data.description.trim().length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  }

  //checks price field for number/not zero
  const rawPrice = data.price;
  const price = typeof rawPrice === "string" && rawPrice.trim() !== "" ? Number(rawPrice) : rawPrice;
  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    errors.price = "Price is required.";
  } else if (typeof price !== "number" || !Number.isFinite(price)) {
    errors.price = "Price must be a number.";
  } else if (price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  //checks category field
  if (typeof data.category !== "string" || !CATEGORIES.includes(data.category as Category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
  }

  //checks availability field
  if (typeof data.available !== "boolean") {
    errors.available = "Available must be true or false.";
  }

  //checks url format
  if (data.imageUrl !== undefined && data.imageUrl !== "") {
    if (typeof data.imageUrl !== "string" || !/^https?:\/\/\S+$/.test(data.imageUrl.trim())) {
      errors.imageUrl = "Image URL must start with http:// or https://.";
    }
  }

  return errors;
}

//converts already-validated input into the clean shape that gets saved to the database
export function toMenuItemInput(data: Record<string, unknown>): MenuItemInput {
  const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
  return {
    name: (data.name as string).trim(),
    description: (data.description as string).trim(),
    price: Number(data.price),
    category: data.category as Category,
    available: data.available as boolean,
    ...(imageUrl ? { imageUrl } : {}),
  };
}
