import type { CreateOfferingInput, Offering } from "@/types/offering";
import { requireManagementAccess } from "@/server/management-access";
import { normalizeOfferingInput, toErrorEnvelope, validateOfferingInput } from "@/lib/offerings";
import { OFFERING_CATEGORIES, type OfferingErrorCode } from "@/types/offering";

export interface OfferingCollectionStore {
  list(): Promise<Offering[]>;
  create(input: CreateOfferingInput): Promise<Offering>;
}

export interface OfferingStore extends OfferingCollectionStore {
  update(id: string, input: CreateOfferingInput): Promise<Offering | null>;
  remove(id: string): Promise<boolean>;
}

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const failure = (code: OfferingErrorCode, message: string, status: number, fields?: Record<string, string>) =>
  reply(toErrorEnvelope(code, message, fields), status);

async function readInput(request: Request): Promise<CreateOfferingInput | Response> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return failure("INVALID_CONTENT_TYPE", "Send offering details as JSON.", 415);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure("INVALID_JSON", "The request contains invalid JSON.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return failure("INVALID_INPUT", "Send one offering object.", 400);
  }
  const values = body as Record<string, unknown>;
  const fields: Record<string, string> = {};
  if (Object.keys(values).some((key) => !["name", "description", "price", "category", "specialOffer"].includes(key))) {
    return failure("INVALID_INPUT", "Only offering detail fields are accepted.", 400);
  }
  if (typeof values.price !== "number") fields.price = "Price must be a JSON number.";
  if (!OFFERING_CATEGORIES.some((category) => category === values.category))
    fields.category = "Choose a valid category.";
  Object.assign(fields, validateOfferingInput(values));
  if (Object.keys(fields).length) return failure("INVALID_INPUT", "Please correct the offering details.", 400, fields);
  return normalizeOfferingInput(values);
}

/** GET/POST need only the independently supplied list/create storage boundary. */
export function createOfferingCollectionHandlers(store: OfferingCollectionStore) {
  return {
    async GET() {
      try {
        return reply(await store.list());
      } catch {
        return failure("DATABASE_UNAVAILABLE", "Offerings are temporarily unavailable. Please try again.", 503);
      }
    },
    async POST(request: Request) {
      const denied = await requireManagementAccess(request);
      if (denied) return denied;
      const input = await readInput(request);
      if (input instanceof Response) return input;
      try {
        return reply(await store.create(input), 201);
      } catch {
        return failure("DATABASE_UNAVAILABLE", "The offering could not be saved. Please try again.", 503);
      }
    },
  };
}

export function createOfferingHandlers(store: OfferingStore) {
  return {
    ...createOfferingCollectionHandlers(store),
    async PUT(request: Request, id: string) {
      const denied = await requireManagementAccess(request);
      if (denied) return denied;
      if (!/^[a-f\d]{24}$/i.test(id)) return failure("INVALID_INPUT", "Choose a valid offering.", 400);
      const input = await readInput(request);
      if (input instanceof Response) return input;
      try {
        const updated = await store.update(id, input);
        return updated ? reply(updated) : failure("NOT_FOUND", "That offering no longer exists. Reload the list.", 404);
      } catch {
        return failure("DATABASE_UNAVAILABLE", "The offering could not be updated. Please try again.", 503);
      }
    },
    async DELETE(request: Request, id: string) {
      const denied = await requireManagementAccess(request);
      if (denied) return denied;
      if (!/^[a-f\d]{24}$/i.test(id)) return failure("INVALID_INPUT", "Choose a valid offering.", 400);
      try {
        return (await store.remove(id))
          ? new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })
          : failure("NOT_FOUND", "That offering no longer exists. Reload the list.", 404);
      } catch {
        return failure("DATABASE_UNAVAILABLE", "The offering could not be deleted. Please try again.", 503);
      }
    },
  };
}
