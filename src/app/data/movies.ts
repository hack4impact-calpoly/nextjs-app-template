import type { MovieType } from "@/database/movieSchema";

// export type Movie = {
//   id: string;
//   title: string;
//   director: string;
//   year: number;
//   runtimeMinutes: number;
//   rating: string;
//   genres: string[];
//   description: string;
//   cast: string[];
//   showtimes: string[];
//   posterLabel: string;
//   posterGradient: string;
// };

export const movies: MovieType[] = [
  {
    id: "spider-man-brand-new-day",
    title: "Spider-Man: Brand New Day",
    director: "Destin Daniel Cretton",
    year: 2026,
    runtimeMinutes: 120,
    rating: "PG-13",
    genres: ["Action", "Adventure", "Sci-Fi"],
    description:
      "Peter Parker begins a new chapter, but a fresh threat pulls him back into the city-spanning responsibility of being Spider-Man.",
    cast: ["Tom Holland", "Zendaya", "Jacob Batalon"],
    showtimes: ["1:15 PM", "4:30 PM", "7:45 PM"],
    posterLabel: "S",
    posterGradient: "linear-gradient(145deg, #172a55 0%, #851b26 55%, #c43834 100%)",
  },
  {
    id: "obsession",
    title: "Obsession",
    director: "Curry Barker",
    year: 2026,
    runtimeMinutes: 96,
    rating: "R",
    genres: ["Horror", "Thriller"],
    description:
      "A hopeless romantic uses a mysterious ritual to win over his longtime crush, only to discover that desire can become dangerously consuming.",
    cast: ["Michael Johnston", "Inde Navarrette", "Cooper Tomlinson"],
    showtimes: ["2:20 PM", "5:35 PM", "9:10 PM"],
    posterLabel: "O",
    posterGradient: "linear-gradient(145deg, #25141c 0%, #713341 50%, #c47a68 100%)",
  },
  {
    id: "coyote-vs-acme",
    title: "Coyote vs. Acme",
    director: "Dave Green",
    year: 2026,
    runtimeMinutes: 91,
    rating: "PG",
    genres: ["Comedy", "Adventure", "Family"],
    description:
      "After one failed contraption too many, Wile E. Coyote hires a down-on-his-luck attorney to take the Acme Corporation to court.",
    cast: ["Will Forte", "John Cena", "Lana Condor"],
    showtimes: ["12:40 PM", "3:50 PM", "6:55 PM"],
    posterLabel: "C",
    posterGradient: "linear-gradient(145deg, #5c2e19 0%, #ca7b2e 52%, #eccb69 100%)",
  },
  {
    id: "onslaught",
    title: "Onslaught",
    director: "Adam Wingard",
    year: 2026,
    runtimeMinutes: 105,
    rating: "R",
    genres: ["Action", "Horror", "Thriller"],
    description:
      "A mother must call on a frightening set of survival skills when a mysterious force traps her family in a relentless nightmare.",
    cast: ["Adria Arjona", "Dan Stevens", "Alex Pereira"],
    showtimes: ["1:50 PM", "5:05 PM", "8:30 PM"],
    posterLabel: "ON",
    posterGradient: "linear-gradient(145deg, #101a18 0%, #1d5148 52%, #77a15d 100%)",
  },
  {
    id: "resident-evil",
    title: "Resident Evil",
    director: "Zach Cregger",
    year: 2026,
    runtimeMinutes: 110,
    rating: "R",
    genres: ["Horror", "Action", "Sci-Fi"],
    description:
      "A new nightmare erupts from the shadows as an ordinary night becomes a desperate fight against a rapidly spreading horror.",
    cast: ["Austin Abrams", "Paul Walter Hauser", "Kali Reis"],
    showtimes: ["2:05 PM", "5:25 PM", "9:00 PM"],
    posterLabel: "RE",
    posterGradient: "linear-gradient(145deg, #111315 0%, #34383a 48%, #791e22 100%)",
  },
];

export function getMovieById(id: string) {
  return movies.find((movie) => movie.id === id);
}
