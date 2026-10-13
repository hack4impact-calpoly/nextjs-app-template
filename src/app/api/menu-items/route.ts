import mongoose from "mongoose";
import connectDB from "@/database/db";
import MenuItem from "@/database/menuItemSchema";
import { MenuItemErrors, toMenuItemInput, validateMenuItem } from "@/lib/validateMenuItem";

/**
 * Example GET API route
 * @returns {message: string}
 */
export async function GET() {
  await connectDB();
  const items = await MenuItem.find();
  return Response.json({ items });
}

/**
 * Creates a menu item after validating the request body.
 * @returns 201 {item} on success, 400 {message, errors} if validation fails, 409 if the name is taken
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const errors = validateMenuItem(body);
  if (Object.keys(errors).length > 0) {
    return Response.json({ message: "Validation failed.", errors }, { status: 400 });
  }

  await connectDB();
  try {
    const newItem = await MenuItem.create(toMenuItemInput(body as Record<string, unknown>));
    return Response.json({ item: newItem }, { status: 201 });
  } catch (err) {
    // Duplicate key on the unique `name` index
    if ((err as { code?: number }).code === 11000) {
      return Response.json(
        { message: "Validation failed.", errors: { name: "An item with this name already exists." } },
        { status: 409 },
      );
    }
    // Fallback: anything the Mongoose schema rejects
    if (err instanceof mongoose.Error.ValidationError) {
      const schemaErrors: MenuItemErrors = {};
      for (const [field, e] of Object.entries(err.errors)) {
        schemaErrors[field as keyof MenuItemErrors] = e.message;
      }
      return Response.json({ message: "Validation failed.", errors: schemaErrors }, { status: 400 });
    }
    console.error(err);
    return Response.json({ message: "Something went wrong saving the menu item." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  console.log(request);
  return Response.json({ success: true });
}
