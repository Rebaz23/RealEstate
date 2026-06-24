"use client";

import { useEffect, useState } from "react";
import type { LeadStatus } from "@realestate/shared";
import { ApiError, LeadWithRelations, listLeads, updateLeadStatus } from "@/lib/api";
import { useOfficeAuth } from "@/lib/auth";

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "QUALIFIED", "CONTACTED", "CLOSED_WON", "CLOSED_LOST"];

export default function LeadsPage() {
  const { officeId } = useOfficeAuth();
  const [leads, setLeads] = useState<LeadWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) return;
    listLeads(officeId)
      .then(setLeads)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load leads."))
      .finally(() => setLoading(false));
  }, [officeId]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    setUpdatingId(id);
    try {
      const updated = await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch {
      setError("Could not update lead status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1>Leads</h1>
      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : leads.length === 0 ? (
        <p className="empty-state">
          No AI-qualified leads yet. They will show up here once the agent qualifies a buyer or renter for one of
          your listings.
        </p>
      ) : (
        <div className="lead-list">
          {leads.map((lead) => (
            <div key={lead.id} className="card lead-card">
              <div className="lead-header">
                <div>
                  <strong>{lead.user?.name ?? "Unknown user"}</strong> · {lead.user?.phone}
                </div>
                <select
                  value={lead.status}
                  disabled={updatingId === lead.id}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lead-listing">
                {lead.listing?.title} · {lead.listing?.neighborhood} · ${lead.listing?.price?.toLocaleString()}
              </div>
              <p className="lead-notes">{lead.qualificationNotes}</p>
              <div className="lead-meta">
                <span>{lead.budgetConfirmed ? "Budget confirmed" : "Budget not confirmed"}</span>
                <span>Intent score: {lead.intentScore}/100</span>
                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
