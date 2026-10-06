import MovieCatalog from "@/app/components/MovieCatalog";
import styles from "@/styles/movies.module.css";
import Navbar from "@/app/components/Navbar";

export default function MoviesPage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <header className={styles.simpleHeader}>
        <h1>Upcoming Movies!</h1>
      </header>
      <MovieCatalog upcoming />
    </main>
  );
}
