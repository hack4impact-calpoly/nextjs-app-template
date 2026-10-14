"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getDrinks } from "@/lib/drinks";
import { Drink } from "@/types/drink";
import DrinkCard from "@/components/DrinkCard";
import Link from "next/link";

export default function Home() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDrinks();
        if (!cancelled) setDrinks(data);
      } catch (err) {
        console.error(err);
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

  const bestSeller = drinks.find((drink) => drink.isBestseller);

  return (
    <main className="home">
      <section className="hero">
        <Image src="/newlogo2.png" alt="Coffee Shop Logo" width={250} height={250} />

        <div>
          <h1>Bean & Brew Co.</h1>
          <h3> Brewing coffee with passion and care. Fostering community one cup at a time. </h3>

          <Link href="/menu" className="order-now-button">
            Order Now
          </Link>
        </div>
      </section>

      <div className="home-content">
        <section className="bestseller">
          <h2> Our Best Seller!</h2>
          {loading ? (
            <p className="page-message" role="status">
              Loading drinks...
            </p>
          ) : error ? (
            <p className="page-message" role="alert">
              Error: {error}
            </p>
          ) : bestSeller ? (
            <DrinkCard drink={bestSeller} />
          ) : (
            <p className="page-message" role="status">
              No bestseller right now. Check out the full menu below!
            </p>
          )}
        </section>

        <section className="order-now">
          <h2>Fresh Ingredients </h2>
          <p>We source the finest beans and ingredients to create the perfect cup of coffee.</p>
          <Image src="/coffeebeans.jpg" alt="Coffee Beans" width={400} height={300} />
        </section>
      </div>

      <div>
        <section className="community">
          <h2>Community</h2>
          <Image src="/community.jpg" alt="Community Event" width={400} height={300} />
          <p>We believe in fostering a sense of community. Join us for events, workshops, and more!</p>
        </section>
      </div>

      <div>
        <section className="sustainability">
          <h2>Sustainability</h2>
          <Image src="/sustainability.jpg" alt="Sustainability" width={400} height={300} />
          <p>We are committed to sustainable practices, from sourcing to packaging.</p>
        </section>
      </div>
    </main>
  );
}
