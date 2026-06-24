"use client";

import { Nav } from "@/components/Nav";
import { useRequireAuth } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { office, loading } = useRequireAuth();

  if (loading || !office) {
    return <div className="centered">Loading…</div>;
  }

  return (
    <>
      <Nav />
      <main className="page">{children}</main>
    </>
  );
}
