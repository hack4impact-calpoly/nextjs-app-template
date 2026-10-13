import Link from "next/link";
import styles from "@/styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <Link className={styles.brand} href="/">
            Pause &amp; Pour
          </Link>
        </div>
        <nav aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/specials">Specials</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p className={styles.disclosure}>Pause &amp; Pour is a fictional café created for a student project.</p>
      </div>
    </footer>
  );
}
