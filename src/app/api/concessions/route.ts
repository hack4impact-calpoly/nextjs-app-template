import MenuItem from "@/database/menuItemSchema";
import connectDB from "@/database/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const items = await MenuItem.find();
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}
