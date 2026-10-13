import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/styles/shop.module.css";

export const metadata: Metadata = { title: "About | Pause & Pour" };

export default function AboutPage() {
  return (
    <main className={styles.contentPage}>
      <h1>About Pause &amp; Pour</h1>
      <p>
        We imagined a neighborhood café for catching up with friends, reading by the window, and taking a break with a
        familiar coffee favorite.
      </p>
      <p>Our name is a simple invitation: pause for a moment and enjoy a good cup.</p>
      <p className={styles.note}>
        This is a fictional café and a student project. There is no physical shop, and we do not take orders.
      </p>
      <Link className={styles.secondary} href="/menu">
        View the menu
      </Link>
    </main>
  );
}
