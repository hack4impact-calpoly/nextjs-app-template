import MovieCatalog from "@/app/components/MovieCatalog";
import styles from "@/styles/movies.module.css";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <main className={styles.page}>
      <Navbar />
      <header className={styles.simpleHeader}>
        <h1>MOVIES</h1>
      </header>

      <MovieCatalog />
    </main>
  );
}
