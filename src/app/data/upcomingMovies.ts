export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  runtimeMinutes: number;
  rating: string;
  genres: string[];
  description: string;
  cast: string[];
  showtimes: string[];
  posterLabel: string;
  posterGradient: string;
};

export const upcomingMovies: Movie[] = [
  {
    id: "starlight-harbor",
    title: "Starlight Harbor",
    director: "Maya Chen",
    year: 2027,
    runtimeMinutes: 118,
    rating: "PG-13",
    genres: ["Sci-Fi", "Drama"],
    description: "A lighthouse keeper discovers a signal from the stars that changes her quiet coastal town forever.",
    cast: ["Ava Reed", "Leo Park", "Nora Ellis"],
    showtimes: ["N/A"],
    posterLabel: "NOW PLAYING",
    posterGradient: "linear-gradient(135deg, #171d42, #5e4b8b, #f29f8e)",
  },
  {
    id: "the-long-way-home",
    title: "The Long Way Home",
    director: "Sam Ortiz",
    year: 2027,
    runtimeMinutes: 105,
    rating: "PG-13",
    genres: ["Romance", "Comedy"],
    description: "Two strangers take an unexpected cross-country road trip after a missed flight.",
    cast: ["Jo Alvarez", "Nina Cho", "Miles Carter"],
    showtimes: ["N/A"],
    posterLabel: "COMING SOON",
    posterGradient: "linear-gradient(135deg, #f6b38b, #e86f76, #8d3c66)",
  },
  {
    id: "paper-kingdoms",
    title: "Paper Kingdoms",
    director: "Ellis Grant",
    year: 2027,
    runtimeMinutes: 132,
    rating: "PG",
    genres: ["Adventure", "Fantasy"],
    description: "A young mapmaker redraws the borders of her world and finds a kingdom hidden between its pages.",
    cast: ["Theo Brandt", "Mira Sol", "James Bell"],
    showtimes: ["N/A"],
    posterLabel: "FAMILY FAVORITE",
    posterGradient: "linear-gradient(135deg, #174b3c, #6ba870, #e9cf78)",
  },
  {
    id: "midnight-orchard",
    title: "Midnight Orchard",
    director: "Priya Nair",
    year: 2027,
    runtimeMinutes: 124,
    rating: "R",
    genres: ["Mystery", "Thriller"],
    description: "After inheriting a remote orchard, a family uncovers a decades-old secret beneath its trees.",
    cast: ["Camille Brooks", "Daniel Kim", "Rosa Martinez"],
    showtimes: ["N/A"],
    posterLabel: "FEATURED",
    posterGradient: "linear-gradient(135deg, #181425, #47334f, #a75f55)",
  },
];
