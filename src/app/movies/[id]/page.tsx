import { getMovieById, movies } from "@/data/movies";
import styles from "@/styles/movies.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return movies.map((movie) => ({ id: movie.id }));
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = getMovieById(id);

  return movie ? { title: `${movie.title} | Movies`, description: movie.description } : { title: "Movie not found" };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);

  if (!movie) notFound();

  return (
    <main className={styles.detailPage}>
      <Link className={styles.backLink} href="/">
        ← All movies
      </Link>

      <article className={styles.detailLayout}>
        <div className={styles.detailPoster} style={{ background: movie.posterGradient }}>
          <span>{movie.posterLabel}</span>
          <strong>{movie.title}</strong>
        </div>

        <div className={styles.detailContent}>
          <p className={styles.detailEyebrow}>Now playing</p>
          <div className={styles.detailTitleRow}>
            <h1>{movie.title}</h1>
            <span className={styles.rating}>{movie.rating}</span>
          </div>
          <p className={styles.detailMeta}>
            {movie.year} · {movie.runtimeMinutes} minutes · {movie.genres.join(" · ")}
          </p>

          <dl className={styles.movieFacts}>
            <div>
              <dt>Director</dt>
              <dd>{movie.director}</dd>
            </div>
            <div>
              <dt>Actors</dt>
              <dd>{movie.cast.join(", ")}</dd>
            </div>
          </dl>

          <p className={styles.detailDescription}>{movie.description}</p>

          <section className={styles.showtimeSection} aria-labelledby="showtime-heading">
            <h2 id="showtime-heading">Choose a showtime</h2>
            <div className={styles.detailShowtimeList}>
              {movie.showtimes.map((showtime) => (
                <Link
                  key={showtime}
                  className={styles.detailShowtime}
                  href={`/seats?movie=${movie.id}&time=${encodeURIComponent(showtime)}`}
                >
                  {showtime}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
