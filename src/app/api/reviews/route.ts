import Review from "@/database/reviewSchema";
import connectDB from "@/database/db";

export async function GET() {
  await connectDB();

  const reviews = await Review.find();
  return Response.json({ reviews });
}

export async function POST(request: Request) {
  console.log(request);
  let body: { username?: unknown; description?: unknown; rating?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const rating = Number(body.rating);

  if (description.length > 50 || username.length < 3) {
    return Response.json({ message: "Username must be 3 characters. Description Max 50 characters." }, { status: 400 });
  }

  if (!username || !description || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { message: "Enter a username, description, and a rating from one to five stars." },
      { status: 400 },
    );
  }

  try {
    await connectDB();
    const newReview = await Review.create({ username, description, rating });
    return Response.json({ item: newReview }, { status: 201 });
  } catch (err) {
    console.error("Could not create review:", err);
    return Response.json({ message: "Could not create review." }, { status: 500 });
  }
}
