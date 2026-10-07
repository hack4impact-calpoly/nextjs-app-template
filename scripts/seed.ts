import mongoose from "mongoose";
import MenuItem from "../src/database/menuItemSchema";
import Movie, { UpcomingMovie } from "../src/database/movieSchema";
import { movies } from "../src/app/data/movies";
import { upcomingMovies } from "../src/app/data/upcomingMovies";

const Menuitems = [
  { name: "Popcorn", price: 5.99, description: "Freshly popped popcorn" },
  { name: "Soda", price: 3.99, description: "Refreshing carbonated drink" },
  { name: "Chips", price: 1.99, description: "Crispy and savory chips" },
  { name: "Candy", price: 2.49, description: "Sweet and delicious candy" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  for (const item of Menuitems) {
    await MenuItem.updateOne({ name: item.name }, item, { upsert: true });
  }
  for (const movie of movies) {
    await Movie.updateOne({ id: movie.id }, movie, { upsert: true });

    for (const movie of upcomingMovies) {
      await UpcomingMovie.updateOne({ id: movie.id }, movie, { upsert: true });
    }
  }

  console.log("Seeded", movies.length, "movies");
  console.log("Seeded", upcomingMovies.length, "upcoming movies");
  console.log("Seeded", Menuitems.length, "menu items");

  await mongoose.disconnect();
}

seed();
