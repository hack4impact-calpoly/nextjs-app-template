import { offeringStore } from "@/database/offeringStore";
import { createOfferingHandlers } from "@/server/offering-handlers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const handlers = createOfferingHandlers(offeringStore);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handlers.PUT(request, (await params).id);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handlers.DELETE(request, (await params).id);
}
