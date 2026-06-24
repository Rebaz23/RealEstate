import { listAllLeads } from "@/lib/api";
import { Nav } from "@/components/Nav";

export default async function LeadsPage() {
  const leads = await listAllLeads();

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-header">
          <h1>Leads</h1>
        </div>
        {leads.length === 0 ? (
          <p className="empty-state">No leads yet.</p>
        ) : (
          <div className="lead-list">
            {leads.map((lead) => (
              <div key={lead.id} className="card lead-card">
                <div className="lead-header">
                  <strong>{lead.user?.name ?? "Unknown user"}</strong>
                  <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
                </div>
                <div className="lead-listing">
                  {lead.listing?.title ?? "Unknown listing"}
                  {lead.listing ? ` · ${lead.listing.neighborhood} · ${lead.listing.price.toLocaleString()}` : ""}
                </div>
                {lead.qualificationNotes && <div className="lead-notes">{lead.qualificationNotes}</div>}
                <div className="lead-meta">
                  <span>Office: {lead.office?.name ?? "—"}</span>
                  <span>Created: {new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
