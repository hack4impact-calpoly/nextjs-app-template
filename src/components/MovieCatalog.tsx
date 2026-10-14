import { movies } from "@/app/data/movies";
import styles from "@/styles/movies.module.css";
import MovieCard from "./MovieCard";

export default function MovieCatalog() {
  return (
    <section className={styles.catalog} aria-label="Movies">
      <div className={styles.movieGrid}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
