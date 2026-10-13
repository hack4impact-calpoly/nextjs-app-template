"use client";

import { useEffect, useState } from "react";
import type { Offering } from "@/types/offering";
import styles from "@/styles/offerings.module.css";
import { isOffering, readOfferingError } from "@/lib/offering-response";

interface OfferingsPageProps {
  title: string;
  intro: string;
  emptyMessage: string;
  specialsOnly?: boolean;
}

export default function OfferingsPage({ title, intro, emptyMessage, specialsOnly = false }: OfferingsPageProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    const fallbackMessage = `Unable to load ${title.toLowerCase()}.`;

    async function loadOfferings() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/offerings");

        if (!response.ok) {
          throw new Error((await readOfferingError(response, fallbackMessage)).message);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || !data.every(isOffering)) {
          throw new Error(fallbackMessage);
        }

        if (isCurrent) {
          setOfferings(data as Offering[]);
        }
      } catch (requestError) {
        if (isCurrent) {
          setOfferings([]);
          setError(requestError instanceof Error ? requestError.message : fallbackMessage);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadOfferings();

    return () => {
      isCurrent = false;
    };
  }, [title, attempt]);

  const visibleOfferings = specialsOnly ? offerings.filter((offering) => offering.specialOffer === true) : offerings;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Our offerings</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>

      {isLoading && <p role="status">Loading {title.toLowerCase()}...</p>}
      {error && <p role="alert">{error}</p>}
      {error && (
        <button className={styles.retry} onClick={() => setAttempt((current) => current + 1)}>
          Try again
        </button>
      )}
      {!isLoading && !error && visibleOfferings.length === 0 && <p>{emptyMessage}</p>}
      {!isLoading && !error && visibleOfferings.length > 0 && (
        <ul className={styles.list}>
          {visibleOfferings.map((offering) => (
            <li className={styles.item} key={offering.ID}>
              <div>
                <h2>{offering.name}</h2>
                <p>{offering.description}</p>
              </div>
              <span className={styles.price}>${offering.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
