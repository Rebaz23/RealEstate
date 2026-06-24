"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, listOffices, OfficeSummary } from "@/lib/api";
import { useOfficeAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, officeId, loading: authLoading } = useOfficeAuth();
  const [offices, setOffices] = useState<OfficeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && officeId) router.replace("/dashboard");
  }, [authLoading, officeId, router]);

  useEffect(() => {
    listOffices()
      .then(setOffices)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not reach the API."))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(id: string) {
    setSigningIn(id);
    try {
      await login(id);
      router.replace("/dashboard");
    } catch {
      setError("Could not sign in. Try again.");
      setSigningIn(null);
    }
  }

  return (
    <div className="centered">
      <div className="login-card">
        <h1>RealEstate AI</h1>
        <p className="subtitle">Office portal — demo login. Pick your office to continue.</p>
        {loading && <p>Loading offices…</p>}
        {error && <p className="error-banner">{error}</p>}
        <div className="office-list">
          {offices.map((office) => (
            <button
              key={office.id}
              className="office-option"
              disabled={signingIn !== null}
              onClick={() => handleLogin(office.id)}
            >
              <div className="office-option-name">{office.name}</div>
              <div className="office-option-meta">
                {office.subscriptionTier} · {office.listingCount} listings · trust {office.trustScore}
                {signingIn === office.id ? " · Signing in…" : ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
