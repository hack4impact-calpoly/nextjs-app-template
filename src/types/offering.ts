/** Browser-safe contracts shared by offering pages and API routes. */
export const OFFERING_CATEGORIES = ["Coffee", "Tea", "Smoothie"] as const;

export type OfferingCategory = (typeof OFFERING_CATEGORIES)[number];

export const OFFERING_INPUT_LIMITS = {
  name: 100,
  description: 500,
  priceDecimalPlaces: 2,
} as const;

export const DEFAULT_SPECIAL_OFFER = false;

/** An offering returned by GET or a successful POST. */
export interface Offering {
  ID: string;
  name: string;
  description: string;
  price: number;
  category: OfferingCategory;
  specialOffer: boolean;
}

/** POST callers supply offering details; the database supplies identity. */
export type CreateOfferingInput = Omit<Offering, "ID" | "specialOffer"> & {
  specialOffer?: boolean;
};

export type OfferingErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "INVALID_JSON"
  | "INVALID_INPUT"
  | "DATABASE_UNAVAILABLE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND";

export interface OfferingErrorResponse {
  error: {
    code: OfferingErrorCode;
    message: string;
    fields?: Partial<Record<keyof CreateOfferingInput, string>>;
  };
}
