import Link from "next/link";
import type { Movie } from "@/types/movie";
import styles from "@/styles/movies.module.css";

export default function MovieCardPreview({ movie, upcoming = false }: { movie: Movie; upcoming?: boolean }) {
  const content = (
    <>
      <div className={styles.poster} style={{ background: movie.posterGradient }}>
        <span className={styles.posterLabel}>{movie.posterLabel}</span>
        <strong className={styles.posterTitle}>{movie.title}</strong>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHeadingRow}>
          <h2 className={styles.cardTitle}>{movie.title}</h2>
          <span className={styles.rating}>{movie.rating}</span>
        </div>
        <p className={styles.cardMeta}>
          {movie.year} · {movie.runtimeMinutes} minutes · {movie.genres.join(" · ")}
        </p>
        <p className={styles.cardDirector}>Directed by {movie.director}</p>
        <p className={styles.cardDescription}>{movie.description}</p>
        <p className={styles.cardCast}>
          <strong>Cast:</strong> {movie.cast.join(", ")}
        </p>
        {!upcoming && (
          <div className={styles.showtimes}>
            {movie.showtimes.map((time) => (
              <span key={time} className={styles.showtime}>
                {time}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <article className={styles.card}>
      {upcoming ? (
        <div className={styles.cardButton}>{content}</div>
      ) : (
        <Link className={styles.cardButton} href={`/movies/${encodeURIComponent(movie.id)}`}>
          {content}
        </Link>
      )}
    </article>
  );
}
