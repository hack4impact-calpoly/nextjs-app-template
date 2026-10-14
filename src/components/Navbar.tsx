import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar">
      <nav>
        <Image src="/newlogo2.png" alt="Coffee" width={50} height={50} />
        <Link href="/">Home</Link>
        <Link href="/menu">Menu</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </div>
  );
}
