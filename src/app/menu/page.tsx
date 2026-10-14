"use client";

import { useEffect, useState } from "react";
import { getDrinks } from "@/lib/drinks";
import { Drink } from "@/types/drink";
import DrinkCard from "@/components/DrinkCard";
import styles from "./page.module.css";
import { filterDrinks } from "@/lib/filterDrinks";

export default function MenuPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDrinks();
        if (!cancelled) setDrinks(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load drinks");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(drinks.map((drink) => drink.category)))];

  const filteredDrinks = filterDrinks(drinks, searchQuery, selectedCategory);

  const grouped = filteredDrinks.reduce<Record<string, Drink[]>>((acc, drink) => {
    (acc[drink.category] ??= []).push(drink);
    return acc;
  }, {});

  return (
    <main className="shop-page">
      <h1>Menu</h1>
      {loading ? (
        <p className="page-message" role="status">
          Loading menu...
        </p>
      ) : error ? (
        <p className="page-message" role="alert">
          Error: {error}
        </p>
      ) : (
        <>
          <div className={styles.filters}>
            <label>
              Search drinks
              <input
                type="search"
                placeholder="Search drinks..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <label>
              Category
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredDrinks.length === 0 ? (
            <p className="page-message" role="status">
              {drinks.length === 0 ? "No drinks available yet." : "No drinks match your search."}
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <section className={styles.category} key={category}>
                <h2>{category}</h2>
                <div className={styles.grid}>
                  {items.map((drink) => (
                    <DrinkCard key={drink._id} drink={drink} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}
