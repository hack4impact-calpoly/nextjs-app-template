import { NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";
import connectDB from "@/database/db";
import OrderModel from "@/database/orderSchema";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isObjectIdOrHexString(params.id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    await connectDB();
    const order = await OrderModel.findByIdAndDelete(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to cancel order", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
