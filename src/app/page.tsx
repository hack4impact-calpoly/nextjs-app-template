import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/shop.module.css";

export default function Home() {
  return (
    <main className={styles.home}>
      <section className={styles.hero} aria-labelledby="welcome-title">
        <div className={styles.heroCopy}>
          <h1 id="welcome-title">
            Take a pause.
            <br />
            Enjoy a good cup.
          </h1>
          <p className={styles.intro}>Coffee favorites and current specials from our imagined neighborhood café.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/menu">
              View the menu
            </Link>
            <Link className={styles.secondary} href="/specials">
              See current specials
            </Link>
          </div>
        </div>
        <figure className={styles.heroFigure}>
          <Image
            src="/images/pause-and-pour-cafe.webp"
            alt="A brown ceramic cup of coffee on a wooden table beside a sunlit café window."
            width={1672}
            height={941}
            sizes="(max-width: 760px) 100vw, 55vw"
            preload
            className={styles.heroImage}
          />
        </figure>
      </section>
    </main>
  );
}
