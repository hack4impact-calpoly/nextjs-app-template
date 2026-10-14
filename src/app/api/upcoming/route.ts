import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import { UpcomingMovie } from "@/database/movieSchema";

export async function GET() {
  try {
    await connectDB();
    const upcomingMovies = await UpcomingMovie.find();
    return NextResponse.json(upcomingMovies);
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return NextResponse.json({ error: "Failed to fetch upcoming movies" }, { status: 500 });
  }
}
