import Link from "next/link";

export default function Navbar() {
  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-6 px-6 py-4">
      <Link href="/">Movies</Link>
      <Link href="/upcoming">Upcoming Movies</Link>
      <Link href="/concession">Concessions</Link>
      <Link href="/contacts">Contact</Link>
    </nav>
  );
}
