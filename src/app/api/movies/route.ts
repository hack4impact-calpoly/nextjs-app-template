import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import MovieModel from "@/database/movieSchema";
import { serializeMovie } from "@/database/movieQueries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const movies = await MovieModel.find({}).sort({ title: 1, _id: 1 }).exec();
    return NextResponse.json(movies.map(serializeMovie), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load movies. Please try again later." }, { status: 500 });
  }
}
