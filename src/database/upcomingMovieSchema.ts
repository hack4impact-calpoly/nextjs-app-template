import mongoose, { Model } from "mongoose";
import { movieSchema, type MovieRecord } from "./movieSchema";

const upcomingMovieSchema = movieSchema.clone();
upcomingMovieSchema.path("posterLabel").default("COMING SOON");

const UpcomingMovieModel =
  (mongoose.models.UpcomingMovie as Model<MovieRecord> | undefined) ||
  mongoose.model<MovieRecord>("UpcomingMovie", upcomingMovieSchema, "upcomingmovies");

export default UpcomingMovieModel;
