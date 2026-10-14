import type { MovieType } from "@/database/movieSchema";
import styles from "./carousel.module.css";

type MovieCardPreviewProps = {
  movie: MovieType;
};

export default function MovieCardPreview({ movie }: MovieCardPreviewProps) {
  return (
    <article className={styles.previewCard}>
      <h2>{movie.title}</h2>
      <p>{movie.director}</p>
      <p>{movie.description}</p>
    </article>
  );
}
