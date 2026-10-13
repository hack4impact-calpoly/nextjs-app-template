import { offeringStore } from "@/database/offeringStore";
import { createOfferingHandlers } from "@/server/offering-handlers";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";
const handlers = createOfferingHandlers(offeringStore);
export const GET = handlers.GET;
export const POST = handlers.POST;
