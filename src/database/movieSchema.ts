import mongoose, { Model, Schema } from "mongoose";
import type { Movie } from "@/types/movie";

export type MovieRecord = Omit<Movie, "id"> & { id?: string };

export const movieSchema = new Schema<MovieRecord>({
  // Existing slugs are optional; the API falls back to MongoDB's _id.
  id: { type: String },
  title: { type: String, required: true },
  director: { type: String, required: true },
  year: { type: Number, required: true },
  runtimeMinutes: { type: Number, required: true, min: 1 },
  rating: { type: String, required: true },
  genres: { type: [String], default: [] },
  description: { type: String, required: true },
  cast: { type: [String], default: [] },
  showtimes: { type: [String], default: [] },
  posterLabel: { type: String, default: "NOW PLAYING" },
  posterGradient: { type: String, default: "linear-gradient(135deg, #171d42, #5e4b8b)" },
});

const MovieModel =
  (mongoose.models.Movie as Model<MovieRecord> | undefined) ||
  mongoose.model<MovieRecord>("Movie", movieSchema, "movies");

export default MovieModel;
