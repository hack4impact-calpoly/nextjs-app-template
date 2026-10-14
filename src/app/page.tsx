import MovieCatalog from "@/components/MovieCatalog";
import styles from "@/styles/movies.module.css";

export default function Home() {
  return (
    <div>
      <main className={styles.page}>
        <header className={styles.simpleHeader}>
          <h1>MOVIES</h1>
        </header>

        <MovieCatalog />
      </main>
    </div>
  );
}
