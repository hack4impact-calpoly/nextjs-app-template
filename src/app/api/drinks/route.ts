import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import DrinkModel from "@/database/drinkSchema";
import { Drink } from "@/types/drink";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const drinks = await DrinkModel.find().sort({ _id: 1 }).lean<Drink[]>();
    return NextResponse.json(drinks, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch drinks", error);
    return NextResponse.json({ error: "Failed to fetch drinks" }, { status: 500 });
  }
}
