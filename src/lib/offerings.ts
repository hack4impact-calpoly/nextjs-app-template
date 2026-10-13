import {
  DEFAULT_SPECIAL_OFFER,
  OFFERING_CATEGORIES,
  OFFERING_INPUT_LIMITS,
  type CreateOfferingInput,
  type OfferingErrorCode,
  type Offering,
  type OfferingCategory,
  type OfferingErrorResponse,
} from "@/types/offering";
import { isOffering, readOfferingError } from "@/lib/offering-response";

export function isOfferingCategory(value: string): value is OfferingCategory {
  return OFFERING_CATEGORIES.some((category) => category === value);
}

type OfferingInputValues = Omit<
  Partial<CreateOfferingInput>,
  "name" | "description" | "category" | "price" | "specialOffer"
> & {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  price?: unknown;
  specialOffer?: unknown;
};

export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseOfferingPrice(value: unknown): number {
  if (typeof value === "string" && value.trim() === "") {
    return Number.NaN;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function normalizeOfferingInput(input: OfferingInputValues): CreateOfferingInput {
  const price = parseOfferingPrice(input.price);
  const category = cleanText(input.category);

  if (!isOfferingCategory(category)) {
    throw new Error("Choose a valid category.");
  }
  if (input.specialOffer !== undefined && typeof input.specialOffer !== "boolean") {
    throw new Error("Special offer must be a boolean.");
  }

  return {
    name: cleanText(input.name),
    description: cleanText(input.description),
    category,
    price: Number.isFinite(price) ? price : Number.NaN,
    specialOffer: input.specialOffer ?? DEFAULT_SPECIAL_OFFER,
  };
}

export function validateOfferingInput(input: OfferingInputValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = cleanText(input.name);
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > OFFERING_INPUT_LIMITS.name) {
    errors.name = `Name must be ${OFFERING_INPUT_LIMITS.name} characters or fewer.`;
  }

  const description = cleanText(input.description);
  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length > OFFERING_INPUT_LIMITS.description) {
    errors.description = `Description must be ${OFFERING_INPUT_LIMITS.description} characters or fewer.`;
  }

  const category = cleanText(input.category);
  if (!category) {
    errors.category = "Category is required.";
  } else if (!isOfferingCategory(category)) {
    errors.category = "Choose a valid category.";
  }

  if (input.specialOffer !== undefined && typeof input.specialOffer !== "boolean") {
    errors.specialOffer = "Special offer must be a boolean.";
  }

  const price = parseOfferingPrice(input.price);
  if (!Number.isFinite(price)) {
    errors.price = "Price must be a valid number.";
  } else if (price < 0) {
    errors.price = "Price must be zero or greater.";
  } else if (
    Math.abs(
      price * 10 ** OFFERING_INPUT_LIMITS.priceDecimalPlaces -
        Math.round(price * 10 ** OFFERING_INPUT_LIMITS.priceDecimalPlaces),
    ) > 1e-8
  ) {
    errors.price = "Price can have at most two decimal places.";
  }

  return errors;
}

export function toErrorEnvelope(
  code: OfferingErrorCode,
  message: string,
  fields?: Record<string, string>,
): OfferingErrorResponse {
  return {
    error: {
      code,
      message,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
  };
}

export function sortOfferings(offerings: Offering[]): Offering[] {
  return [...offerings].sort((left, right) => left.name.localeCompare(right.name) || left.ID.localeCompare(right.ID));
}

export async function fetchOfferings(signal?: AbortSignal): Promise<Offering[]> {
  const response = await fetch("/api/offerings", { method: "GET", signal });
  if (!response.ok) {
    throw new Error((await readOfferingError(response, "We could not load the current offerings.")).message);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isOffering))
    throw new Error("The offering list could not be read. Please try again.");
  return sortOfferings(payload);
}

export class OfferingApiError extends Error {
  constructor(
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "OfferingApiError";
  }
}

export async function submitOffering(input: Partial<CreateOfferingInput>): Promise<Offering> {
  return saveOffering("/api/offerings", "POST", input);
}

export async function updateOffering(id: string, input: Partial<CreateOfferingInput>): Promise<Offering> {
  return saveOffering(`/api/offerings/${encodeURIComponent(id)}`, "PUT", input);
}

async function saveOffering(
  url: string,
  method: "POST" | "PUT",
  input: Partial<CreateOfferingInput>,
): Promise<Offering> {
  const normalized = normalizeOfferingInput(input);

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalized),
  });

  if (!response.ok) {
    const { message, fields } = await readOfferingError(response, "The offering could not be saved.");
    throw new OfferingApiError(message, fields);
  }

  const offering: unknown = await response.json();
  if (!isOffering(offering))
    throw new OfferingApiError("The server returned an unreadable save result. Reload the list before trying again.");
  return offering;
}

export async function deleteOffering(id: string): Promise<void> {
  const response = await fetch(`/api/offerings/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) {
    throw new OfferingApiError((await readOfferingError(response, "The offering could not be deleted.")).message);
  }
}
