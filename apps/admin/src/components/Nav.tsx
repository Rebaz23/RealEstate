"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/offices", label: "Offices" },
  { href: "/listings", label: "Listings" },
  { href: "/leads", label: "Leads" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <div className="nav-brand">RealEstate AI · Admin</div>
      <nav className="nav-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
