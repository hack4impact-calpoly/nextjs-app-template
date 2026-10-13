import MenuItem from "@/database/menuItemSchema";
import connectDB from "@/database/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const item = await MenuItem.findById(id);
  return Response.json({ item });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const item = await MenuItem.findByIdAndDelete(id);
  return Response.json({ success: true });
}
