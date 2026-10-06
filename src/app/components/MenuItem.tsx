import type { MenuItem as MenuItemData } from "@/types/menuItem";

export default function MenuItem({ name, price, description }: Omit<MenuItemData, "id">) {
  return (
    <article className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p>{description}</p>
      <p>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)}</p>
    </article>
  );
}
