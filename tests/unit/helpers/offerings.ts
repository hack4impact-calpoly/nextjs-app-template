import type { Offering } from "@/types/offering";

/** Sample data for controlled component tests, never a runtime fallback. */
export const sampleOffering: Offering = {
  ID: "sample-latte",
  name: "Latte",
  description: "Espresso and milk",
  price: 4.25,
  category: "Coffee",
  specialOffer: false,
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
