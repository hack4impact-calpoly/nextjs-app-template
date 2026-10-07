import mongoose, { Schema, type InferSchemaType } from "mongoose";

//export type Movie = {
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

//Example

// const MenuItemSchema = new Schema({
//   name: { type: String, required: true, unique: true },
//   price: { type: Number, required: true, min: 0 },
//   description: { type: String },
// });

const MovieSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  director: { type: String, required: true },
  year: { type: Number, required: true },
  runtimeMinutes: { type: Number, required: true },
  rating: { type: String, required: true },
  genres: { type: [String], required: true },
  description: { type: String, required: true },
  cast: { type: [String], required: true },
  showtimes: { type: [String], required: true },
  posterLabel: { type: String, required: true },
  posterGradient: { type: String, required: true },
});

export type MovieType = InferSchemaType<typeof MovieSchema>;

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);

export const UpcomingMovie = mongoose.models.UpcomingMovie || mongoose.model("UpcomingMovie", MovieSchema);
