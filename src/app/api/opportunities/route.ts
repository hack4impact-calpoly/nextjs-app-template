import { NextResponse } from "next/server";

// GET is tracked in issue #9 and POST in issue #10. See those issues for requirements.
// Get the database client from "@/lib/mongodb" and use the "volunteerfinder" db,
// "opportunities" collection (the seed script fills it with the mock data).

export async function GET() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}
