import { isObjectIdOrHexString, type HydratedDocument } from "mongoose";
import connectDB from "./db";
import MovieModel, { type MovieRecord } from "./movieSchema";
import type { Movie } from "@/types/movie";

export function serializeMovie(movie: HydratedDocument<MovieRecord>): Movie {
  return {
    id: movie.get("id") || movie._id.toString(),
    title: movie.title,
    director: movie.director,
    year: movie.year,
    runtimeMinutes: movie.runtimeMinutes,
    rating: movie.rating,
    genres: movie.genres,
    description: movie.description,
    cast: movie.cast,
    showtimes: movie.showtimes,
    posterLabel: movie.posterLabel,
    posterGradient: movie.posterGradient,
  };
}

// Server-rendered detail pages read the same collection as /api/movies.
export async function getMovieById(id: string): Promise<Movie | null> {
  await connectDB();
  const filter = isObjectIdOrHexString(id) ? { $or: [{ id }, { _id: id }] } : { id };
  const movie = await MovieModel.findOne(filter).exec();
  return movie ? serializeMovie(movie) : null;
}
