import { NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";
import connectDB from "@/database/db";
import DrinkModel from "@/database/drinkSchema";
import OrderModel from "@/database/orderSchema";
import { validateOrderOptions } from "@/lib/orderValidation";
import { Drink } from "@/types/drink";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 50;

export async function GET() {
  try {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an order object" }, { status: 400 });
  }

  const { drinkId, size, milk, customerName } = body as Record<string, unknown>;
  if (typeof drinkId !== "string" || !isObjectIdOrHexString(drinkId)) {
    return NextResponse.json({ error: "drinkId must be a valid drink ID" }, { status: 400 });
  }
  if (typeof size !== "string" || !size) {
    return NextResponse.json({ error: "size is required and must be a string" }, { status: 400 });
  }
  if (milk !== undefined && typeof milk !== "string") {
    return NextResponse.json({ error: "milk must be a string when provided" }, { status: 400 });
  }
  if (typeof customerName !== "string" || !customerName.trim()) {
    return NextResponse.json({ error: "A name is required for the order" }, { status: 400 });
  }
  if (customerName.trim().length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }, { status: 400 });
  }

  try {
    await connectDB();
    const drink = await DrinkModel.findById(drinkId).lean<Drink>();
    if (!drink) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 });
    }

    const validation = validateOrderOptions(drink, size, milk);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { sizeOption } = validation;

    const order = await OrderModel.create({
      drinkId: drink._id,
      drinkName: drink.name,
      customerName: customerName.trim(),
      size: sizeOption.size,
      ...(milk !== undefined ? { milk } : {}),
      price: sizeOption.price,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to place order", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
