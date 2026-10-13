"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/styles/navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/specials", label: "Specials" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {links.map((link) => {
          const isActive = link.href === pathname;
          return (
            <li key={link.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
