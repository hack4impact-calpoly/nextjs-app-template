import Link from "next/link";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contacts", label: "Contacts" },
  { href: "/concession", label: "Concession" },
  { href: "/upcoming", label: "Upcoming" },
];

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}> Theater Name </div>
      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
