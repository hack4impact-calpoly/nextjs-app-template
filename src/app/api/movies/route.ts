import Movie from "@/database/movieSchema";
import { NextResponse } from "next/server";
import connectDB from "@/database/db";

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
