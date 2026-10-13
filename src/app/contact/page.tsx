import type { Metadata } from "next";
import styles from "@/styles/shop.module.css";

export const metadata: Metadata = { title: "Contact | Pause & Pour" };

export default function ContactPage() {
  return (
    <main className={styles.contentPage}>
      <h1>Contact</h1>
      <p>Pause &amp; Pour is a fictional student project. We have no physical location or customer contact service.</p>
      <section className={styles.hoursSection} aria-labelledby="sample-hours">
        <h2 id="sample-hours">Sample hours</h2>
        <p>Illustrative hours for our imagined café.</p>
        <dl className={styles.hours}>
          <div>
            <dt>Monday–Friday</dt>
            <dd>7am–5pm</dd>
          </div>
          <div>
            <dt>Saturday–Sunday</dt>
            <dd>8am–4pm</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
