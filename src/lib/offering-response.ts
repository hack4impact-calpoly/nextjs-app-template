import { OFFERING_CATEGORIES, type Offering } from "@/types/offering";

/** Validate external responses before sorting or rendering them. */
export function isOffering(value: unknown): value is Offering {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Offering>;
  return (
    typeof item.ID === "string" &&
    item.ID.length > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    OFFERING_CATEGORIES.some((category) => category === item.category) &&
    typeof item.specialOffer === "boolean"
  );
}
/** Parse only displayable fields from an untrusted API error response. */
export async function readOfferingError(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  const error = body && typeof body === "object" && "error" in body ? body.error : null;
  if (!error || typeof error !== "object") return { message: fallback, fields: {} };
  const message =
    "message" in error && typeof error.message === "string" && error.message.trim() ? error.message : fallback;
  const rawFields = "fields" in error ? error.fields : null;
  const fields: Record<string, string> = {};
  if (rawFields && typeof rawFields === "object" && !Array.isArray(rawFields))
    for (const [key, value] of Object.entries(rawFields))
      if (
        ["name", "description", "price", "category", "specialOffer"].includes(key) &&
        typeof value === "string" &&
        value.trim()
      )
        fields[key] = value;
  return { message, fields };
}
