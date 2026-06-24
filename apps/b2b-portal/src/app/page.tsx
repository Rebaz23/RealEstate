"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOfficeAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { officeId, loading } = useOfficeAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(officeId ? "/dashboard" : "/login");
  }, [loading, officeId, router]);

  return <div className="centered">Loading…</div>;
}
