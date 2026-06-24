import { listAllLeads, listAllListings, listOffices } from "@/lib/api";
import { Nav } from "@/components/Nav";

export default async function OverviewPage() {
  const [offices, listings, leads] = await Promise.all([listOffices(), listAllListings(), listAllLeads()]);

  const activeListings = listings.filter((l) => l.status === "ACTIVE").length;
  const avgTrustScore = listings.length
    ? Math.round(listings.reduce((sum, l) => sum + l.trustScore, 0) / listings.length)
    : 0;
  const qualifiedLeads = leads.filter((l) => l.status !== "NEW").length;

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-header">
          <h1>Platform overview</h1>
        </div>
        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-label">Offices</div>
            <div className="stat-value">{offices.length}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Listings</div>
            <div className="stat-value">{listings.length}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Active listings</div>
            <div className="stat-value">{activeListings}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Avg. trust score</div>
            <div className="stat-value">{avgTrustScore}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Leads</div>
            <div className="stat-value">{leads.length}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Qualified leads</div>
            <div className="stat-value">{qualifiedLeads}</div>
          </div>
        </div>
        <div className="card">
          <h2>About this view</h2>
          <p className="subtitle" style={{ margin: 0 }}>
            Read-only platform-operator visibility across all offices. See Offices, Listings, and Leads for the full
            breakdown.
          </p>
        </div>
      </main>
    </>
  );
}
