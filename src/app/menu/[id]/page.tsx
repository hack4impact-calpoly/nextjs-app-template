"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Drink } from "@/types/drink";
import { getDrink } from "@/lib/drinks";
import { OrderForm } from "@/components/OrderForm";
import styles from "./page.module.css";

export default function Page({ params }: { params: { id: string } }) {
  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDrink(params.id);
        if (cancelled) return;
        if (data) {
          setDrink(data);
        } else {
          setIsNotFound(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load drink");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="shop-page">
        <p className="page-message" role="status">
          Loading drink...
        </p>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="shop-page">
        <p className="page-message" role="alert">
          Drink not found. It may have been removed from the menu. <Link href="/menu">Back to the menu</Link>
        </p>
      </main>
    );
  }

  if (error || !drink) {
    return (
      <main className="shop-page">
        <p className="page-message" role="alert">
          Something went wrong loading this drink. Please try again later. ({error})
        </p>
      </main>
    );
  }

  return (
    <main className="shop-page">
      <Link className={styles.backLink} href="/menu">
        ← Back to menu
      </Link>

      <div className={styles.layout}>
        <Image
          className={styles.image}
          src={drink.imageUrl}
          alt={drink.name}
          width={400}
          height={300}
          sizes="(max-width: 760px) 100vw, 50vw"
          priority
        />

        <div className={styles.details}>
          <h1>{drink.name}</h1>

          <OrderForm drink={drink} />
        </div>
      </div>
    </main>
  );
}
