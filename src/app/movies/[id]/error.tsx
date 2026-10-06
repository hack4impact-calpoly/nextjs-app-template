"use client";

import Link from "next/link";

export default function MovieError({ reset }: { reset: () => void }) {
  return (
    <main className="p-8">
      <h1>Unable to load this movie</h1>
      <p>Please try again later.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
      <p>
        <Link href="/">Back to movies</Link>
      </p>
    </main>
  );
}
