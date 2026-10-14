import { NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";
import connectDB from "@/database/db";
import DrinkModel from "@/database/drinkSchema";
import { Drink } from "@/types/drink";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!isObjectIdOrHexString(params.id)) {
    return NextResponse.json({ error: "Drink not found" }, { status: 404 });
  }

  try {
    await connectDB();
    const drink = await DrinkModel.findById(params.id).lean<Drink>();
    if (!drink) {
      return NextResponse.json({ error: "Drink not found" }, { status: 404 });
    }
    return NextResponse.json(drink, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch drink", error);
    return NextResponse.json({ error: "Failed to fetch drink" }, { status: 500 });
  }
}
