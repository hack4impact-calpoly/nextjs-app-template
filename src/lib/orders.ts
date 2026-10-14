import { NewOrder, Order } from "@/types/order";

async function checkResponse(response: Response, message: string): Promise<void> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : `${message}: ${response.status}`);
  }
}

export async function placeOrder(order: NewOrder): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
    cache: "no-store",
  });
  await checkResponse(response, "Failed to place order");
  return response.json();
}

export async function getOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders", { cache: "no-store" });
  await checkResponse(response, "Failed to fetch orders");
  return response.json();
}

export async function cancelOrder(id: string): Promise<void> {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  await checkResponse(response, "Failed to cancel order");
}
