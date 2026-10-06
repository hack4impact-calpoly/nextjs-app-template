"use client";

import MenuItem from "./MenuItem";
import { getMenuItem } from "@/lib/api";
import useCollection from "@/lib/useCollection";

export default function ConcessionMenu() {
  const { items, loading, error, retry } = useCollection(getMenuItem);

  if (loading) return <p role="status">Loading concessions…</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  if (items.length === 0) return <p>No concessions available yet.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MenuItem key={item.id} name={item.name} price={item.price} description={item.description} />
      ))}
    </div>
  );
}
