import type { ReactNode } from "react";
import styles from "./carousel.module.css";

type MovieCarouselProps = {
  children: ReactNode;
};

export default function MovieCarousel({ children }: MovieCarouselProps) {
  return <section className={styles.carousel}>{children}</section>;
}
