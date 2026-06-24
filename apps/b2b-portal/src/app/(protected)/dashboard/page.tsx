"use client";

import Link from "next/link";
import { TrustBadge } from "@/components/TrustBadge";
import { useOfficeAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { office } = useOfficeAuth();
  if (!office) return null;

  return (
    <div>
      <h1>{office.name}</h1>
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Subscription</div>
          <div className="stat-value">{office.subscriptionTier}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Lead credits</div>
          <div className="stat-value">{office.leadCredits}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Listings</div>
          <div className="stat-value">{office.listingCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Leads received</div>
          <div className="stat-value">{office.leadCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Trust score</div>
          <div className="stat-value">
            <TrustBadge score={office.trustScore} compact />
          </div>
        </div>
      </div>
      <div className="card">
        <h2>Contact on file</h2>
        <p>{office.phone}</p>
        <p>{office.email}</p>
      </div>
      <div className="quick-links">
        <Link href="/listings" className="btn btn-primary">
          Manage listings
        </Link>
        <Link href="/leads" className="btn btn-secondary">
          View leads
        </Link>
      </div>
    </div>
  );
}
