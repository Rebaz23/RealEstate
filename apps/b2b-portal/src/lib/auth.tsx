"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOffice, OfficeSummary } from "./api";

const STORAGE_KEY = "realestate.officeId";

interface AuthState {
  officeId: string | null;
  office: OfficeSummary | null;
  loading: boolean;
  login: (officeId: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function OfficeAuthProvider({ children }: { children: React.ReactNode }) {
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [office, setOffice] = useState<OfficeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOffice = useCallback(async (id: string) => {
    try {
      const detail = await getOffice(id);
      setOffice(detail);
      setOfficeId(id);
    } catch {
      // Stale id (e.g. after a database reseed) — fall back to logged-out state.
      localStorage.removeItem(STORAGE_KEY);
      setOffice(null);
      setOfficeId(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      loadOffice(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadOffice]);

  const login = useCallback(
    async (id: string) => {
      localStorage.setItem(STORAGE_KEY, id);
      await loadOffice(id);
    },
    [loadOffice]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOffice(null);
    setOfficeId(null);
  }, []);

  const refresh = useCallback(async () => {
    if (officeId) await loadOffice(officeId);
  }, [officeId, loadOffice]);

  return (
    <AuthContext.Provider value={{ officeId, office, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useOfficeAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useOfficeAuth must be used within OfficeAuthProvider");
  return ctx;
}

// For pages that require a signed-in office: redirects to /login once we know
// for sure there's no session, while `loading` keeps the caller from rendering
// real content (or flashing the login redirect) before that's settled.
export function useRequireAuth() {
  const router = useRouter();
  const { officeId, office, loading } = useOfficeAuth();

  useEffect(() => {
    if (!loading && !officeId) router.replace("/login");
  }, [loading, officeId, router]);

  return { officeId, office, loading: loading || (!!officeId && !office) };
}
