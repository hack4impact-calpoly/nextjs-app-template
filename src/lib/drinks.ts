import { Drink } from "@/types/drink";

export async function getDrinks(): Promise<Drink[]> {
  const res = await fetch("/api/drinks");
  if (!res.ok) {
    throw new Error(`Failed to fetch drinks: ${res.status}`);
  }
  return res.json();
}

export async function getDrink(id: string): Promise<Drink | null> {
  const res = await fetch(`/api/drinks/${encodeURIComponent(id)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch drink ${id}: ${res.status}`);
  }
  return res.json();
}
