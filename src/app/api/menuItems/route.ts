import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import MenuItemModel from "@/database/menuItemSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const items = await MenuItemModel.find({}).sort({ name: 1, _id: 1 }).exec();
    return NextResponse.json(
      items.map((item) => ({
        id: item.get("id") || item._id.toString(),
        name: item.name,
        price: item.price,
        description: item.description,
      })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load concessions. Please try again later." }, { status: 500 });
  }
}
