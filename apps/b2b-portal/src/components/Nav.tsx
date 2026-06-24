"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOfficeAuth } from "@/lib/auth";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Listings" },
  { href: "/leads", label: "Leads" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { office, logout } = useOfficeAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="nav">
      <div className="nav-brand">RealEstate AI · Office Portal</div>
      <nav className="nav-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="nav-office">
        <span>{office?.name}</span>
        <button onClick={handleLogout} className="btn-link">
          Log out
        </button>
      </div>
    </header>
  );
}
