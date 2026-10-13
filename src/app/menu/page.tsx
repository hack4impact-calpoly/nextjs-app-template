"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/menu.module.css";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  category: string;
  imageUrl?: string;
};

const sections = [
  { category: "coffee", title: "Coffee" },
  { category: "tea", title: "Tea" },
  { category: "milktea", title: "Milktea" },
  { category: "pastry", title: "Pastry" },
  { category: "cake", title: "Cake" },
] as const;

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/menu-items")
      .then((response) => response.json())
      .then((data) => {
        setMenuItems(data.items);
      });
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Menu</h1>

      {sections.map(({ category, title }) => {
        const items = menuItems.filter((item) => item.category === category);

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>

            <ul className={styles.menuGrid}>
              {items.map((item) => (
                <li key={item._id} className={styles.menuCard}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className={styles.menuImage} />}

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.itemName}>{item.name}</h3>

                      <span className={styles.price}>${item.price.toFixed(2)}</span>
                    </div>

                    <p className={styles.description}>{item.description}</p>

                    {!item.available && <p className={styles.unavailable}>Currently unavailable</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
