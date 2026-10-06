"use client";

import MovieCardPreview from "./MovieCardPreview";
import { getMovies, getUpcomingMovies } from "@/lib/api";
import useCollection from "@/lib/useCollection";
import styles from "@/styles/movies.module.css";

export default function MovieCatalog({ upcoming = false }: { upcoming?: boolean }) {
  const { items: movies, loading, error, retry } = useCollection(upcoming ? getUpcomingMovies : getMovies);

  return (
    <section className={styles.catalog} aria-label={upcoming ? "Upcoming movies" : "Now playing"}>
      {loading ? (
        <p role="status">Loading movies…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p>No {upcoming ? "upcoming movies" : "movies"} available yet.</p>
      ) : (
        <div className={styles.movieGrid}>
          {movies.map((movie) => (
            <MovieCardPreview key={movie.id} movie={movie} upcoming={upcoming} />
          ))}
        </div>
      )}
    </section>
  );
}
