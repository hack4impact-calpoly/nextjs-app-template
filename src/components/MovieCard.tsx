import type { MovieType } from "@/database/movieSchema";
import styles from "@/styles/movies.module.css";
import Link from "next/link";

type MovieCardProps = {
  movie: MovieType;
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className={styles.card}>
      <Link
        className={styles.cardButton}
        href={`/movies/${movie.id}`}
        aria-label={`View details and showtimes for ${movie.title}`}
      >
        <span className={styles.poster} style={{ background: movie.posterGradient }} aria-hidden="true">
          <span className={styles.posterLabel}>{movie.posterLabel}</span>
          <span className={styles.posterTitle}>{movie.title}</span>
        </span>
        <span className={styles.cardBody}>
          <span className={styles.cardHeadingRow}>
            <span className={styles.cardTitle}>{movie.title}</span>
            <span className={styles.rating}>{movie.rating}</span>
          </span>
          <span className={styles.cardDirector}>Directed by {movie.director}</span>
          <span className={styles.cardMeta}>
            {movie.year} · {movie.runtimeMinutes} min · {movie.genres.join(" · ")}
          </span>
          <span className={styles.cardDescription}>{movie.description}</span>
          <span className={styles.cardCast}>
            <strong>Starring</strong> {movie.cast.join(", ")}
          </span>
          <span className={styles.showtimes}>
            {movie.showtimes.map((showtime) => (
              <span key={showtime} className={styles.showtime}>
                {showtime}
              </span>
            ))}
          </span>
        </span>
      </Link>
    </article>
  );
}
