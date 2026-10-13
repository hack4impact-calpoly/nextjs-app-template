"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  category: string;
};

export default function OrderPage() {
  // itemId -> quantity
  const [order, setOrder] = useState<Record<string, number>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/menu-items")
      .then((response) => response.json())
      .then((data) => {
        setMenuItems(data.items);
      });
  }, []);

  const addItem = (id: string) => setOrder((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  const removeItem = (id: string) =>
    setOrder((prev) => {
      const qty = (prev[id] ?? 0) - 1;
      const { [id]: _removed, ...rest } = prev;
      return qty > 0 ? { ...rest, [id]: qty } : rest;
    });

  // Derived values: no extra state needed
  const orderLines = menuItems.filter((item) => order[item._id]).map((item) => ({ item, quantity: order[item._id] }));

  const total = orderLines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);

  return (
    <main className="page two-column">
      <section>
        <h1>Menu</h1>
        <ul className="item-list">
          {menuItems.map((item) => (
            <li key={item._id}>
              <h3>
                {item.name} · ${item.price.toFixed(2)}
              </h3>
              <p>{item.description}</p>
              <button onClick={() => addItem(item._id)}>Add to order</button>
            </li>
          ))}
        </ul>
      </section>

      <aside>
        <h2>Your Order</h2>
        {orderLines.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <>
            <ul className="item-list">
              {orderLines.map(({ item, quantity }) => (
                <li key={item._id}>
                  {item.name} × {quantity} — ${(item.price * quantity).toFixed(2)}{" "}
                  <button onClick={() => removeItem(item._id)}>−</button>
                  <button onClick={() => addItem(item._id)}>+</button>
                </li>
              ))}
            </ul>
            <strong>Total: ${total.toFixed(2)}</strong>
          </>
        )}
      </aside>
    </main>
  );
}
