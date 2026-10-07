import MovieCard from "@/components/MovieCardPreview";
import MovieCarousel from "@/components/Carousel";
import { upcomingMovies } from "@/app/data/upcomingMovies";

export default function MoviesPage() {
  return (
    <main>
      <h1>Upcoming Movies!</h1>

      <MovieCarousel>
        {upcomingMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </MovieCarousel>
    </main>
  );
}
